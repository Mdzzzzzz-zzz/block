#import "CallbackContext.h"
#include "JsbCall.h"
@implementation CallbackContext

- (instancetype)initWithCallbackId:(NSString *)callbackId {
    self = [super init];
    if (self) {
        self._callbackId = callbackId;
    }
    return self;
}

- (void)successWithParams:(NSString *)params {
    [JsbCall successCall:self._callbackId params:params];
}

- (void)failureWithParams:(NSString *)params {
    [JsbCall failureCall:self._callbackId params:params];
}

- (void)successWithJSONObject:(NSDictionary *)obj {
    [JsbCall successCall:self._callbackId params:[self jsonStringFromJSONObject:obj]];
}

- (void)failureWithJSONObject:(NSDictionary *)obj {
    [JsbCall failureCall:self._callbackId params:[self jsonStringFromJSONObject:obj]];
}

- (NSString *)jsonStringFromJSONObject:(NSDictionary *)obj {
    NSError *error;
    NSData *jsonData = [NSJSONSerialization dataWithJSONObject:obj options:0 error:&error];
    if (!jsonData) {
        NSLog(@"Error converting JSONObject to JSON string: %@", error);
        return @"";
    } else {
        return [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
    }
}

@end
