//
//  RCTBridgefySwift.swift
//  Hyperlocal
//
//  Created by Adrian Gri on 2022-11-03.
//

import Foundation
import BridgefySDK

@objc(RCTBridgefySwift) class RCTBridgefySwift: RCTEventEmitter {
  var apiKey = "e259da26-3f8f-42c2-b354-a9fb9fa353e2"
  var testDelegate = MyDelegate()
  var bridgefyInstance: Bridgefy
  public static var emitter: RCTEventEmitter!

  override init() {
    do {
      try self.bridgefyInstance = Bridgefy(withAPIKey: apiKey, delegate: testDelegate, verboseLogging: true)
    } catch let error as BridgefyError {
      let errorCode: Int = getErrorCode(error: error)
      print("(swift-init) Failed to initialize Bridgefy instance with error code \(errorCode)")
      fatalError("(swift-init) Failed to initialize Bridgefy instance with error code \(errorCode)")
    } catch {
      // Unknown error occurred
      print("(swift-init) Failed to initialize Bridgefy instance with unknown error code")
      fatalError("(swift-init) Failed to initialize Bridgefy instance with unknown error code")
    }
    
    super.init()
    RCTBridgefySwift.emitter = self
  }
  
  open override func supportedEvents() -> [String] {
    ["onFailedToStart", "onDidStart", "onDidStop", "onDidFailToStop", "onDidConnect", "onDidDisconnect", "onEstablishedSecureConnection", "onFailedToEstablishSecureConnection", "onMessageSent", "onMessageSentFailed", "onDidRecieveMessage"]
  }
  
  @objc static override func requiresMainQueueSetup() -> Bool { return true }
  
  @objc func startSDK(
    _ callback: RCTResponseSenderBlock
  ) {
    bridgefyInstance.start()
    callback([false, "Success"])
  }
  
  @objc func sendMessage(
    _ message: String,
    id: String,
    callback: RCTResponseSenderBlock
  ) {
    do {
      print("(swift-sendMessage) Message: \(message), id: \(id)");
      let result = try bridgefyInstance.send(message.data(using: .utf8)!,
                                             using: BridgefySDK.TransmissionMode.mesh(userId: UUID(uuidString: id)!))
      callback([false, result.description])
    } catch let error as BridgefyError {
      let errorCode: Int = getErrorCode(error: error)
      callback([true, String(errorCode)])
    } catch {
      // Unknown error occurred
      callback([true, String(-1)])
    }
  }
  
  @objc func getUserId(
    _ callback: RCTResponseSenderBlock
  ) {
    let userId = bridgefyInstance.currentUserId
    callback([false, userId.description])
  }
}

class MyDelegate: BridgefyDelegate, ObservableObject {
  func bridgefyDidFailToStart(with error: BridgefySDK.BridgefyError) {
    let errorCode = getErrorCode(error: error)
    print("(swift-bridgefyDidFailToStart) Failed to start with error code \(errorCode)");
    
    RCTBridgefySwift.emitter.sendEvent(withName: "onFailedToStart", body: [errorCode])
  }

  func bridgefyDidStart() {
    print("(swift-bridgefyDidStart) Started")
    
    RCTBridgefySwift.emitter.sendEvent(withName: "onDidStart", body: [])
  }

  func bridgefyDidConnect(with userID: UUID) {
    print("(swift-bridgefyDidConnect) Connected with user ID \(userID.description)")
    
    RCTBridgefySwift.emitter.sendEvent(withName: "onDidConnect", body: [userID.description])
  }

  func bridgefyDidDisconnect(from userID: UUID) {
    print("(swift-bridgefyDidDisconnect) Disconnected with user ID \(userID.description)")
    
    RCTBridgefySwift.emitter.sendEvent(withName: "onDidDisconnect", body: [userID.description])
  }

  func bridgefyDidSendMessage(with messageID: UUID) {
    print("(swift-bridgefyDidSendMessage) Sent message with message ID \(messageID.description)")
    print("(swift-bridgefyDidSendMessage) Send message debug: \(messageID.debugDescription)")
    
    RCTBridgefySwift.emitter.sendEvent(withName: "onMessageSent", body: [messageID.description])
  }

  func bridgefyDidFailSendingMessage(with messageID: UUID, withError error: BridgefySDK.BridgefyError) {
    let errorCode = getErrorCode(error: error)
    print("(swift-bridgefyDidFailSendingMessage) Failed to send message with message ID: \(messageID.description) returning error code \(errorCode)")
    
    RCTBridgefySwift.emitter.sendEvent(withName: "onMessageSentFailed", body: [messageID.description, errorCode])
  }

  func bridgefyDidReceiveData(_ data: Data, with messageID: UUID, using transmissionMode: BridgefySDK.TransmissionMode) {
    print("(swift-bridgefyDidReceiveData) Recieved data: \(data.description) with message ID \(messageID.description) using transmission mode \(getTransmissionMode(transmisssionMode: transmissionMode))")
    
    let message = String(decoding: data, as: UTF8.self);
    var output: UUID = UUID(uuid: UUID_NULL);
    
    if case let .p2p(i) = transmissionMode {
      output = i;
    } else if case let .mesh(i) = transmissionMode {
      output = i;
    }
    
    RCTBridgefySwift.emitter.sendEvent(withName: "onDidRecieveMessage", body: [message, messageID.description, output.description])
  }

  func bridgefyDidStop() {
    print("(swift-bridgefyDidStop) Stopped")
    
    RCTBridgefySwift.emitter.sendEvent(withName: "onDidStop", body: [])
  }
  
  func bridgefyDidFailToStop(with error: BridgefyError) {
    let errorCode = getErrorCode(error: error)

    print("(swift-bridgefyDidFailToStop) Failed to start with error code \(errorCode)")
    
    RCTBridgefySwift.emitter.sendEvent(withName: "onDidFailToStop", body: [errorCode])
  }
  
  func bridgefyDidEstablishSecureConnection(with userId: UUID) {
    print("(swift-bridgefyDidEstablishSecureConnection) Established secure connection with \(userId.description)")
    
    RCTBridgefySwift.emitter.sendEvent(withName: "onEstablishedSecureConnection", body: [userId.description])
  }
  
  func bridgefyDidFailToEstablishSecureConnection(with userId: UUID, error: BridgefyError) {
    let errorCode = getErrorCode(error: error)

    print("(swift-bridgefyDidFailToEstablishSecureConnection) Failed to establish secure connection with \(userId.description), returning error code \(errorCode)")
    
    RCTBridgefySwift.emitter.sendEvent(withName: "onFailedToEstablishSecureConnection", body: [userId.description, errorCode])
  }
}

func getErrorCode(error: BridgefySDK.BridgefyError) -> Int {
  switch error {
  case .simulatorIsNotSupported:
    return(0)
  case .notStarted:
    return(1)
  case .alreadyInstantiated:
    return(2)
  case .startInProgress:
    return(3)
  case .alreadyStarted:
    return(4)
  case .serviceNotStarted:
    return(5)
  case .missingBundleID:
    return(6)
  case .invalidAPIKey:
    return(7)
  case .internetConnectionRequired:
    return(8)
  case .sessionError:
    return(9)
  case .expiredLicense:
    return(10)
  case .inconsistentDeviceTime:
    return(11)
  case .BLEUsageNotGranted:
    return(12)
  case .BLEUsageRestricted:
    return(13)
  case .BLEPoweredOff:
    return(14)
  case .BLEUnsupported:
    return(15)
  case .BLEUnknownError:
    return(16)
  case .inconsistentConnection:
    return(17)
  case .connectionIsAlreadySecure:
    return(18)
  case .cannotCreateSecureConnection:
    return(19)
  case .dataLengthExceeded:
    return(20)
  case .dataValueIsEmpty:
    return(21)
  case .peerIsNotConnected:
    return(22)
  case .internalError:
    return(23)
  case .licenseError:
    return(24)
  case .storageError:
    return(25)
  case .encodingError:
    return(26)
  case .encryptionError:
    return(27)
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
