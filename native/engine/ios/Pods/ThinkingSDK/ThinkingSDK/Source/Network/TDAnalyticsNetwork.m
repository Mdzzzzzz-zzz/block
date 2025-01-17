#import "TDAnalyticsNetwork.h"

#import <ThinkingDataCore/NSData+TDGzip.h>
#import <ThinkingDataCore/TDJSONUtil.h>
#import "TDLogging.h"
#import "TDSecurityPolicy.h"
#import "TDAppState.h"

#if TARGET_OS_IOS
#import "TDToastView.h"
#endif

static NSString *kTAIntegrationType = @"TA-Integration-Type";
static NSString *kTAIntegrationVersion = @"TA-Integration-Version";
static NSString *kTAIntegrationCount = @"TA-Integration-Count";
static NSString *kTAIntegrationExtra = @"TA-Integration-Extra";
static NSString *kTADatasType = @"TA-Datas-Type";

@implementation TDAnalyticsNetwork

- (NSURLSession *)sharedURLSession {
    static NSURLSession *sharedSession = nil;
    @synchronized(self) {
        if (sharedSession == nil) {
            NSURLSessionConfiguration *sessionConfig = [NSURLSessionConfiguration defaultSessionConfiguration];
            sharedSession = [NSURLSession sessionWithConfiguration:sessionConfig delegate:self delegateQueue:nil];
        }
    }
    return sharedSession;
}

- (NSString *)URLEncode:(NSString *)string {
    NSString *encodedString = [string stringByAddingPercentEncodingWithAllowedCharacters:[[NSCharacterSet characterSetWithCharactersInString:@"?!@#$^&%*+,:;='\"`<>()[]{}/\\| "] invertedSet]];
    return encodedString;
}

- (int)flushDebugEvents:(NSDictionary *)record withAppid:(NSString *)appid {
    __block int debugResult = -1;
    NSMutableDictionary *recordDic = [record mutableCopy];
    NSMutableDictionary *properties = [[recordDic objectForKey:@"properties"] mutableCopy];
    
    if ([ThinkingAnalyticsSDK isTrackEvent:[record objectForKey:@"#type"]]) {
        @synchronized ([TDDeviceInfo sharedManager]) {
            [properties addEntriesFromDictionary:[[TDDeviceInfo sharedManager] getAutomaticData]];
        }
    }
    [recordDic setObject:properties forKey:@"properties"];
    NSString *jsonString = [TDJSONUtil JSONStringForObject:recordDic];
    NSMutableURLRequest *request = [self buildDebugRequestWithJSONString:jsonString withAppid:appid withDeviceId:[[[TDDeviceInfo sharedManager] getAutomaticData] objectForKey:@"#device_id"]];
    dispatch_semaphore_t flushSem = dispatch_semaphore_create(0);

    void (^block)(NSData *, NSURLResponse *, NSError *) = ^(NSData *data, NSURLResponse *response, NSError *error) {
        
        if (error || ![response isKindOfClass:[NSHTTPURLResponse class]]) {
            debugResult = -2;
            TDLogError(@"Debug Networking error:%@", error);
            [self callbackNetworkErrorWithRequest:jsonString error:error.debugDescription];
            dispatch_semaphore_signal(flushSem);
            return;
        }
        NSHTTPURLResponse *urlResponse = (NSHTTPURLResponse *)response;
        if ([urlResponse statusCode] == 200) {
            NSError *err;
            
            if (!data) {
                return;
            }
            
            NSDictionary *retDic = [NSJSONSerialization JSONObjectWithData:data options:kNilOptions error:&err];
            if (err) {
                TDLogError(@"Debug data json error:%@", err);
                debugResult = -2;
            } else if ([[retDic objectForKey:@"errorLevel"] isEqualToNumber:[NSNumber numberWithInt:1]]) {
                debugResult = 1;
                NSArray* errorProperties = [retDic objectForKey:@"errorProperties"];
                NSMutableString *errorStr = [NSMutableString string];
                for (id obj in errorProperties) {
                    NSString *errorReasons = [obj objectForKey:@"errorReason"];
                    NSString *propertyName = [obj objectForKey:@"propertyName"];
                    [errorStr appendFormat:@" propertyName:%@ errorReasons:%@\n", propertyName, errorReasons];
                }
                TDLogError(@"Debug data error:%@", errorStr);
            } else if ([[retDic objectForKey:@"errorLevel"] isEqualToNumber:[NSNumber numberWithInt:2]]) {
                debugResult = 2;
                NSString *errorReasons = [[retDic objectForKey:@"errorReasons"] componentsJoinedByString:@" "];
                TDLogError(@"Debug data error:%@", errorReasons);
            } else if ([[retDic objectForKey:@"errorLevel"] isEqualToNumber:[NSNumber numberWithInt:0]]) {
                debugResult = 0;
                TDLogDebug(@"Verify data success.");
            } else if ([[retDic objectForKey:@"errorLevel"] isEqualToNumber:[NSNumber numberWithInt:-1]]) {
                debugResult = -1;
                NSString *errorReasons = [[retDic objectForKey:@"errorReasons"] componentsJoinedByString:@" "];
                TDLogError(@"Debug mode error:%@", errorReasons);
            }
            
            static dispatch_once_t onceToken;
            dispatch_once(&onceToken, ^{
                if (debugResult == 0 || debugResult == 1 || debugResult == 2) {
#if TARGET_OS_IOS
                    dispatch_async(dispatch_get_main_queue(), ^{
                        UIApplication *application = [TDAppState sharedApplication];
                        if (![application isKindOfClass:UIApplication.class]) {
                            return;
                        }
                        UIWindow *window = application.keyWindow;
                        [TDToastView showInWindow:window text:[NSString stringWithFormat:@"The current mode is:%@", self.mode == TDModeDebugOnly ? @"DebugOnly(Data is not persisted) \n The test joint debugging stage is allowed to open \n Please turn off the Debug function before the official launch" : @"Debug"] duration:2.0];
                    });
#endif
                }
            });
            
            @try {
                if ([retDic isKindOfClass:[NSDictionary class]]) {
                    if ([[(NSDictionary *)retDic objectForKey:@"errorLevel"] integerValue] != 0) {
                        NSData *jsonData = [NSJSONSerialization dataWithJSONObject:retDic options:NSJSONWritingPrettyPrinted error:NULL];
                        NSString *string = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
                        [self callbackNetworkErrorWithRequest:jsonString error:string];
                    }
                }
            } @catch (NSException *exception) {
                
            }
        } else {
            debugResult = -2;
            NSString *urlResponse = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
            TDLogError(@"%@", [NSString stringWithFormat:@"Debug %@ network failed with response '%@'.", self, urlResponse]);
            [self callbackNetworkErrorWithRequest:jsonString error:urlResponse];
        }
        dispatch_semaphore_signal(flushSem);
    };

    NSURLSessionDataTask *task = [[self sharedURLSession] dataTaskWithRequest:request completionHandler:block];
    [task resume];

    dispatch_semaphore_wait(flushSem, DISPATCH_TIME_FOREVER);
    return debugResult;
}

- (BOOL)flushEvents:(NSArray<NSDictionary *> *)recordArray {
    __block BOOL flushSucc = YES;
    UInt64 time = [[NSDate date] timeIntervalSince1970] * 1000;
    NSDictionary *flushDic = @{
        @"data": recordArray,
        @"#app_id": self.appid,
        @"#flush_time": @(time),
    };
    
    __block BOOL isEncrypt;
    [recordArray enumerateObjectsUsingBlock:^(NSDictionary * _Nonnull obj, NSUInteger idx, BOOL * _Nonnull stop) {
        if ([obj.allKeys containsObject:@"ekey"]) {
            isEncrypt = YES;
            *stop = YES;
        }
    }];
    
    NSString *jsonString = [TDJSONUtil JSONStringForObject:flushDic];
    NSMutableURLRequest *request = [self buildRequestWithJSONString:jsonString];
    [request addValue:[TDDeviceInfo sharedManager].libName forHTTPHeaderField:kTAIntegrationType];
    [request addValue:[TDDeviceInfo sharedManager].libVersion forHTTPHeaderField:kTAIntegrationVersion];
    [request addValue:@(recordArray.count).stringValue forHTTPHeaderField:kTAIntegrationCount];
    [request addValue:@"iOS" forHTTPHeaderField:kTAIntegrationExtra];
    if (isEncrypt) {
        [request addValue:@"1" forHTTPHeaderField:kTADatasType];
    }
//    [request addValue:@"Keep-Alive" forHTTPHeaderField:@"Connection"];
//    [request addValue:@"timeout=15,max=100" forHTTPHeaderField:@"Keep-Alive"];
    
    dispatch_semaphore_t flushSem = dispatch_semaphore_create(0);

    void (^block)(NSData *, NSURLResponse *, NSError *) = ^(NSData *data, NSURLResponse *response, NSError *error) {
        if (error || ![response isKindOfClass:[NSHTTPURLResponse class]]) {
            flushSucc = NO;
            TDLogError(@"Networking error:%@", error);
            [self callbackNetworkErrorWithRequest:jsonString error:error.debugDescription];
            dispatch_semaphore_signal(flushSem);
            return;
        }

        NSHTTPURLResponse *urlResponse = (NSHTTPURLResponse *)response;
        if ([urlResponse statusCode] == 200) {
            flushSucc = YES;
            TDLogDebug(@"flush success sendContent---->:%@",flushDic);
            if (!data) {
                return;
            }
            id result = [NSJSONSerialization JSONObjectWithData:data options:kNilOptions error:nil];
            TDLogDebug(@"flush success responseData---->%@",result);
            
            @try {
                if ([result isKindOfClass:[NSDictionary class]]) {
                    if ([[(NSDictionary *)result objectForKey:@"code"] integerValue] != 0) {
                        NSData *jsonData = [NSJSONSerialization dataWithJSONObject:result options:NSJSONWritingPrettyPrinted error:NULL];
                        NSString *string = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
                        [self callbackNetworkErrorWithRequest:jsonString error:string];
                    }
                }
            } @catch (NSException *exception) {
                
            }

        } else {
            flushSucc = NO;
            NSString *urlResponse = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
            TDLogError(@"%@", [NSString stringWithFormat:@"%@ network failed with response '%@'.", self, urlResponse]);
            [self callbackNetworkErrorWithRequest:jsonString error:urlResponse];
        }

        dispatch_semaphore_signal(flushSem);
    };

    NSURLSessionDataTask *task = [[self sharedURLSession] dataTaskWithRequest:request completionHandler:block];
    [task resume];
    dispatch_semaphore_wait(flushSem, DISPATCH_TIME_FOREVER);
    return flushSucc;
}

- (void)callbackNetworkErrorWithRequest:(NSString *)request error:(NSString *)error {
    if (request == nil && error == nil) return;
    
    ThinkingAnalyticsSDK *tdSDK = [ThinkingAnalyticsSDK instanceWithAppid:self.appid];
    if (tdSDK.errorCallback) {
        NSInteger code = 10001;
        NSString *errorMsg = error;
        NSString *ext = request;
        tdSDK.errorCallback(code, errorMsg, ext);
    }
}

- (NSMutableURLRequest *)buildRequestWithJSONString:(NSString *)jsonString {
    
    NSData *zippedData = [NSData td_gzipData:[jsonString dataUsingEncoding:NSUTF8StringEncoding]];
    NSString *postBody = [zippedData base64EncodedStringWithOptions:0];
    NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:self.serverURL];
//    NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:[NSURL URLWithString:@"http://192.168.20.23:8991/sync"]];
    [request setHTTPMethod:@"POST"];
    [request setHTTPBody:[postBody dataUsingEncoding:NSUTF8StringEncoding]];
    NSString *contentType = [NSString stringWithFormat:@"text/plain"];
    [request addValue:contentType forHTTPHeaderField:@"Content-Type"];
    [request setTimeoutInterval:60.0];
    return request;
}

- (NSMutableURLRequest *)buildDebugRequestWithJSONString:(NSString *)jsonString withAppid:(NSString *)appid withDeviceId:(NSString *)deviceId {
    // dryRun=0, if the verification is passed, it will be put into storage. dryRun=1, no storage
    int dryRun = self.mode == TDModeDebugOnly ? 1 : 0;
    NSString *postData = [NSString stringWithFormat:@"appid=%@&source=client&dryRun=%d&deviceId=%@&data=%@", appid, dryRun, deviceId, [self URLEncode:jsonString]];
    NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:self.serverDebugURL];
    [request setHTTPMethod:@"POST"];
    request.HTTPBody = [postData dataUsingEncoding:NSUTF8StringEncoding];
    return request;
}

- (void)fetchRemoteConfig:(NSString *)appid handler:(TDFlushConfigBlock)handler {
    void (^block)(NSData *, NSURLResponse *, NSError *) = ^(NSData *data, NSURLResponse *response, NSError *error) {
        if (error || ![response isKindOfClass:[NSHTTPURLResponse class]]) {
            TDLogError(@"Get remote config failed:%@", error);
            return;
        }
        NSError *err;
        if (!data) {
            return;
        }
        NSDictionary *ret = [NSJSONSerialization JSONObjectWithData:data options:kNilOptions error:&err];
        if (err) {
            TDLogError(@"Get remote config error:%@", err);
        } else if ([ret isKindOfClass:[NSDictionary class]] && [ret[@"code"] isEqualToNumber:[NSNumber numberWithInt:0]]) {
            TDLogInfo(@"Get remote config for %@ : %@", appid, [ret objectForKey:@"data"]);
            handler([ret objectForKey:@"data"], error);
        } else {
            TDLogError(@"Get remote config failed");
        }
    };
    NSString *urlStr = [NSString stringWithFormat:@"%@?appid=%@", self.serverURL, appid];
    NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:[NSURL URLWithString:urlStr]];
    [request setHTTPMethod:@"Get"];
    NSURLSessionDataTask *task = [[self sharedURLSession] dataTaskWithRequest:request completionHandler:block];
    [task resume];
}

#pragma mark - NSURLSessionDelegate
- (void)URLSession:(NSURLSession *)session didReceiveChallenge:(NSURLAuthenticationChallenge *)challenge completionHandler:(void (^)(NSURLSessionAuthChallengeDisposition, NSURLCredential * _Nullable))completionHandler {
    NSURLSessionAuthChallengeDisposition disposition = NSURLSessionAuthChallengePerformDefaultHandling;
    NSURLCredential *credential = nil;

    if (self.sessionDidReceiveAuthenticationChallenge) {
        disposition = self.sessionDidReceiveAuthenticationChallenge(session, challenge, &credential);
    } else {
        if ([challenge.protectionSpace.authenticationMethod isEqualToString:NSURLAuthenticationMethodServerTrust]) {
            if ([self.securityPolicy evaluateServerTrust:challenge.protectionSpace.serverTrust forDomain:challenge.protectionSpace.host]) {
                credential = [NSURLCredential credentialForTrust:challenge.protectionSpace.serverTrust];
                if (credential) {
                    disposition = NSURLSessionAuthChallengeUseCredential;
                } else {
                    disposition = NSURLSessionAuthChallengePerformDefaultHandling;
                }
            } else {
                disposition = NSURLSessionAuthChallengeCancelAuthenticationChallenge;
            }
        } else {
            disposition = NSURLSessionAuthChallengePerformDefaultHandling;
        }
    }

    if (completionHandler) {
        completionHandler(disposition, credential);
    }
}

@end
