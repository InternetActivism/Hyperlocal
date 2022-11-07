//
//  RCTBridgefySwift.m
//  Hyperlocal
//
//  Created by Adrian Gri on 2022-11-03.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(RCTBridgefySwift, RCTEventEmitter)

RCT_EXTERN_METHOD(startSDK:
                  (RCTResponseSenderBlock) callback
                  )
RCT_EXTERN_METHOD(sendMessage:
                (NSString *) message
                id: (NSString *)id
                callback: (RCTResponseSenderBlock)callback
                )
RCT_EXTERN_METHOD(supportedEvents)
@end
