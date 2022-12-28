//
//  RCTBridgefySwift.swift
//  Hyperlocal
//
//  Created by Adrian Gri on 2022-11-03.
//

import Foundation
import BridgefySDK

@objc(RCTBridgefySwift) class RCTBridgefySwift: RCTEventEmitter {
  var apiKey = "8dd066a7-c2b5-4b4a-912e-9c8f17f7ed14"
  var testDelegate = MyDelegate()
  
  public static var emitter: RCTEventEmitter!

  override init() {
    super.init()
    RCTBridgefySwift.emitter = self
  }
  
  open override func supportedEvents() -> [String] {
    ["onFailedToStart", "onDidStart", "onDidConnect", "onDidDisconnect", "onMessageSent", "onMessageSentFailed", "onDidRecieveMessage"]
  }
  
  @objc static override func requiresMainQueueSetup() -> Bool { return true }
  
  @objc func startSDK(
    _ callback: RCTResponseSenderBlock
  ) {
    do {
      try Bridgefy.manager.start(withAPIKey: apiKey, delegate: testDelegate, verboseLogging: true)
      callback([0, "Success"])
    } catch let error as BridgefyError {
      let errorCode: Int = getErrorCode(error: error)
      callback([1, String(errorCode)])
    } catch {
      // Unknown error occurred
      callback([1, String(-1)])
    }
  }
  
  @objc func sendMessage(
    _ message: String,
    id: String,
    callback: RCTResponseSenderBlock
  ) {
    do {
      print("(swift-sendMessage) message: \(message), id: \(id)");
      let result = try Bridgefy.manager.send(message.data(using: .utf8)!,
                                             using: BridgefySDK.TransmissionMode.p2p(userID: UUID(uuidString: id)!))
      callback([0, result.description])
    } catch let error as BridgefyError {
      let errorCode: Int = getErrorCode(error: error)
      callback([1, String(errorCode)])
    } catch {
      // Unknown error occurred
      callback([1, String(-1)])
    }
  }
}

class MyDelegate: BridgefyDelegate, ObservableObject {
    func bridgefyDidFailToStart(with error: BridgefySDK.BridgefyError) {
      let errorCode = getErrorCode(error: error)
      print("(swift-bridgefyDidFailToStart) failed to start with error code \(errorCode)");
      
      RCTBridgefySwift.emitter.sendEvent(withName: "onFailedToStart", body: [errorCode])
    }

    func bridgefyDidStart(with currentUserID: UUID) {
      print("(swift-bridgefyDidStart) started with user ID \(currentUserID.description)");
      
      RCTBridgefySwift.emitter.sendEvent(withName: "onDidStart", body: [currentUserID.description])
    }

    func bridgefyDidConnect(with userID: UUID) {
      print("(swift-bridgefyDidConnect) connected with user ID \(userID.description)")
      
      RCTBridgefySwift.emitter.sendEvent(withName: "onDidConnect", body: [userID.description])
    }

    func bridgefyDidDisconnect(from userID: UUID) {
      print("(swift-bridgefyDidDisconnect) disconnected with user ID \(userID.description)")
      
      RCTBridgefySwift.emitter.sendEvent(withName: "onDidDisconnect", body: [userID.description])
    }

    func bridgefyDidSendMessage(with messageID: UUID) {
      print("(swift-bridgefyDidSendMessage) sent message with message ID \(messageID.description)")
      print("(swift-bridgefyDidSendMessage) send message debug: \(messageID.debugDescription)")
      
      RCTBridgefySwift.emitter.sendEvent(withName: "onMessageSent", body: [messageID.description])
    }

    func bridgefyDidFailSendingMessage(with messageID: UUID, withError error: BridgefySDK.BridgefyError) {
      let errorCode = getErrorCode(error: error)
      print("(swift-bridgefyDidFailSendingMessage) failed to send message with message ID: \(messageID.description) returning error code \(errorCode)")
      
      RCTBridgefySwift.emitter.sendEvent(withName: "onMessageSentFailed", body: [messageID.description, errorCode])
    }

    func bridgefyDidReceiveData(_ data: Data, with messageID: UUID, using transmissionMode: BridgefySDK.TransmissionMode) {
      print("(swift-bridgefyDidReceiveData) recieved data: \(data.description) with message ID \(messageID.description) using transmission mode \(getTransmissionMode(transmisssionMode: transmissionMode))")
      
      let message = String(decoding: data, as: UTF8.self);
      var output: UUID = UUID(uuid: UUID_NULL);
      
      if case let .p2p(i) = transmissionMode {
        output = i;
      }
      
      RCTBridgefySwift.emitter.sendEvent(withName: "onDidRecieveMessage", body: [message, messageID.description, output.description])
    }
}

func getErrorCode(error: BridgefySDK.BridgefyError) -> Int {
  switch error {
  case .simulatorIsNotSupported:
    return(0)
  case .notStarted:
    return(1)
  case .alreadyStarted:
    return(2)
  case .missingBundleID:
    return(3)
  case .invalidAPIKeyFormat:
    return(4)
  case .internetConnectionRequired:
    return(5)
  case .sessionError:
    return(6)
  case .expiredLicense:
    return(7)
  case .inconsistentDeviceTime:
    return(8)
  case .BLEUsageNotGranted:
    return(9)
  case .BLEUsageRestricted:
    return(10)
  case .BLEPoweredOff:
    return(11)
  case .BLEUnsupported:
    return(12)
  case .BLEUnknownError:
    return(13)
  case .dataLengthExceeded:
    return(14)
  case .dataValueIsEmpty:
    return(15)
  case .peerIsNotConnected:
    return(16)
  case .licenseError:
    return(17)
  case .storageError:
    return(18)
  case .encodingError:
    return(19)
  case .encryptionError:
    return(20)
  default:
    return(-1)
  }
}

func getTransmissionMode(transmisssionMode: BridgefySDK.TransmissionMode) -> String {
  switch transmisssionMode {
  case .p2p:
    return("p2p")
  case .mesh:
    return("mesh")
  case .broadcast:
    return("broadcast")
  default:
    return("unknown")
  }
}
