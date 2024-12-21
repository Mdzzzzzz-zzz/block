cmake_minimum_required(VERSION 3.8)

set(CMAKE_SYSTEM_NAME iOS)
set(APP_NAME "BlockMaster"  CACHE STRING "Project Name")

project(${APP_NAME} CXX)

set(CC_PROJECT_DIR ${CMAKE_CURRENT_LIST_DIR})
set(CC_UI_RESOURCES)
set(CC_PROJ_SOURCES)
set(CC_ASSET_FILES)
set(CC_COMMON_SOURCES)
set(CC_ALL_SOURCES)

include(${CC_PROJECT_DIR}/../common/CMakeLists.txt)
set(EXECUTABLE_NAME ${APP_NAME}-mobile)
set(APPLOVIN_SDK_KEY "OmDRO8whS_xJT0fChdR0d_v0wqSKGaEhzs6W8SKO-Lspt2WA_ZpCmlTTHBVTEEDMET5hw4vN9SmtK5x4_eEHsR")
include_directories(
    ${CMAKE_CURRENT_LIST_DIR}/Plugins
    ${CMAKE_CURRENT_LIST_DIR}/Pods
)
set(JSB_BRIDGE_SDK_SOURCE
    ${CMAKE_CURRENT_LIST_DIR}/Plugins/AdDelegate.h
    ${CMAKE_CURRENT_LIST_DIR}/Plugins/AdDelegate.m
    ${CMAKE_CURRENT_LIST_DIR}/Plugins/AdMaxPlugin.h
    ${CMAKE_CURRENT_LIST_DIR}/Plugins/AdMaxPlugin.m
    ${CMAKE_CURRENT_LIST_DIR}/Plugins/AppsFlyerPlugin.h
    ${CMAKE_CURRENT_LIST_DIR}/Plugins/AppsFlyerPlugin.m
    ${CMAKE_CURRENT_LIST_DIR}/Plugins/BannerAdDelegate.h
    ${CMAKE_CURRENT_LIST_DIR}/Plugins/BannerAdDelegate.m
    ${CMAKE_CURRENT_LIST_DIR}/Plugins/BuglyPlugin.h
    ${CMAKE_CURRENT_LIST_DIR}/Plugins/BuglyPlugin.m
    ${CMAKE_CURRENT_LIST_DIR}/Plugins/CallbackContext.h
    ${CMAKE_CURRENT_LIST_DIR}/Plugins/CallbackContext.m
    ${CMAKE_CURRENT_LIST_DIR}/Plugins/InterstitialAdDelegate.h
    ${CMAKE_CURRENT_LIST_DIR}/Plugins/InterstitialAdDelegate.m
    ${CMAKE_CURRENT_LIST_DIR}/Plugins/JsbCall.h
    ${CMAKE_CURRENT_LIST_DIR}/Plugins/JsbCall.m
    ${CMAKE_CURRENT_LIST_DIR}/Plugins/JsbEvent.h
    ${CMAKE_CURRENT_LIST_DIR}/Plugins/JsbEvent.m
    ${CMAKE_CURRENT_LIST_DIR}/Plugins/Plugin.h
    ${CMAKE_CURRENT_LIST_DIR}/Plugins/Plugin.m
    ${CMAKE_CURRENT_LIST_DIR}/Plugins/PluginManager.h
    ${CMAKE_CURRENT_LIST_DIR}/Plugins/PluginManager.m
    ${CMAKE_CURRENT_LIST_DIR}/Plugins/RewardedAdDelegate.h
    ${CMAKE_CURRENT_LIST_DIR}/Plugins/RewardedAdDelegate.m
    ${CMAKE_CURRENT_LIST_DIR}/Plugins/SplashPlugin.h
    ${CMAKE_CURRENT_LIST_DIR}/Plugins/SplashPlugin.m
    ${CMAKE_CURRENT_LIST_DIR}/Plugins/TaPlugin.h
    ${CMAKE_CURRENT_LIST_DIR}/Plugins/TaPlugin.m
    ${CMAKE_CURRENT_LIST_DIR}/Plugins/ToastPlugin.h
    ${CMAKE_CURRENT_LIST_DIR}/Plugins/ToastPlugin.m
    ${CMAKE_CURRENT_LIST_DIR}/Plugins/UIView+Toast.h
    ${CMAKE_CURRENT_LIST_DIR}/Plugins/UIView+Toast.m
)
list(APPEND CC_PROJ_SOURCES
    ${JSB_BRIDGE_SDK_SOURCE}
)

cc_ios_before_target(${EXECUTABLE_NAME})
add_executable(${EXECUTABLE_NAME} ${CC_ALL_SOURCES})
cc_ios_after_target(${EXECUTABLE_NAME})
