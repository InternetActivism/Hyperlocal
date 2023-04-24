//
//  RCTBridgefyModule.m
//  Hyperlocal
//
//  Created by Adrian Gri on 2022-11-03.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(RCTBridgefyModule, RCTEventEmitter)

RCT_EXTERN_METHOD(startSDK:
                  (RCTResponseSenderBlock) callback
                  )
RCT_EXTERN_METHOD(stopSDK:
                  (RCTResponseSenderBlock) callback
                  )
RCT_EXTERN_METHOD(sendMessage:
                (NSString *) message
                id: (NSString *)id
                transmissionMode: (NSString *)transmissionMode
                callback: (RCTResponseSenderBlock)callback
                )
RCT_EXTERN_METHOD(getUserId:
                  (RCTResponseSenderBlock) callback
                  )
RCT_EXTERN_METHOD(getConnectedPeers:
                  (RCTResponseSenderBlock) callback
                  )
RCT_EXTERN_METHOD(supportedEvents)
RCT_EXTERN_METHOD(establishSecureConnection:
                  (NSString *) id
                  callback: (RCTResponseSenderBlock)callback
                  )
RCT_EXTERN_METHOD(updateLicense:
                  callback: (RCTResponseSenderBlock)callback
                  )
RCT_EXTERN_METHOD(destroySession:
                  (RCTResponseSenderBlock) callback
                  )
@end
