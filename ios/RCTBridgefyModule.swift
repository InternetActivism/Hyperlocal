//
//  RCTBridgefyModule.swift
//  Hyperlocal
//
//  Created by Adrian Gri on 2022-11-03.
//

import Foundation
import BridgefySDK

@objc(RCTBridgefyModule) class RCTBridgefyModule: RCTEventEmitter {
  var apiKey = "e259da26-3f8f-42c2-b354-a9fb9fa353e2"
  var testDelegate = MyDelegate()
  var bridgefyInstance: Bridgefy? = nil
  public static var emitter: RCTEventEmitter!

  override init() {
    super.init()
    RCTBridgefyModule.emitter = self
  }
  
  open override func supportedEvents() -> [String] {
      ["onFailedToStart", "onDidStart", "onDidStop", "onDidFailToStop", "onDidConnect", "onDidDisconnect", "onEstablishedSecureConnection", "onFailedToEstablishSecureConnection", "onMessageSent", "onMessageSentFailed", "onDidReceiveMessage"]
    }
  
  @objc static override func requiresMainQueueSetup() -> Bool { return true }
  
  @objc func startSDK(
    _ callback: RCTResponseSenderBlock
  ) {
    print("(swift-startSDK) Starting SDK...")
    do {
      if self.bridgefyInstance == nil {
        try self.bridgefyInstance = Bridgefy(withAPIKey: apiKey, delegate: testDelegate, verboseLogging: true)
        print("(swift-init) Initialized SDK")
      }
      
      guard let bridgefy = self.bridgefyInstance else {
        callback([true, "28"])
        return
      }
      
      bridgefy.start()
      callback([false, "Success"])
    } catch let error as BridgefyError {
      let errorCode: Int = getErrorCode(error: error)
      print("(swift-init) Failed to initialize Bridgefy instance with error code \(errorCode)")
      callback([true, String(errorCode)])
    } catch {
      // Unknown error occurred
      print("(swift-init) Failed to initialize Bridgefy instance with unknown error code")
      callback([true, String(-1)])
    }
  }
  
  @objc func stopSDK(
    _ callback: RCTResponseSenderBlock
  ) {
    print("(swift-stopSDK) Stopping SDK...")
    guard let bridgefy = self.bridgefyInstance else {
      callback([true, "28"])
      return
    }
    
    bridgefy.stop()
    callback([false, "Success"])
  }

  @objc func updateLicense(
    _ callback: RCTResponseSenderBlock
  ) {
    print("(swift-updateLicense) Updating license...")
    guard let bridgefy = self.bridgefyInstance else {
      callback([true, "28"])
      return
    }
    
    bridgefy.updateLicense()
    callback([false, "Success"])
  }

  @objc func establishSecureConnection(
    _ id: String,
    callback: RCTResponseSenderBlock
  ) {
    print("(swift-establishSecureConnection) Establishing secure connection with user ID \(id)")
    guard let bridgefy = self.bridgefyInstance else {
      callback([true, "28"])
      return
    }
    
    bridgefy.establishSecureConnection(with: UUID(uuidString: id)!)
    callback([false, "Success"])
  }

  
  @objc func sendMessage(
    _ message: String,
    id: String,
    transmissionMode: String,
    callback: RCTResponseSenderBlock
  ) {
    do {
      print("(swift-sendMessage) Message: \(message), id: \(id)");

      guard let bridgefy = self.bridgefyInstance else {
        callback([true, "28"])
        return
      }
      
       if transmissionMode == "p2p" {
         let result = try bridgefy.send(message.data(using: .utf8)!,
                                             using: BridgefySDK.TransmissionMode.p2p(userId: UUID(uuidString: id)!))
        callback([false, result.description])
      } else if transmissionMode == "mesh" {
        callback([true, String("not-implemented")]) // throw error
      } else if transmissionMode == "broadcast" {
        let result = try bridgefy.send(message.data(using: .utf8)!,
                                             using: BridgefySDK.TransmissionMode.broadcast(senderId: UUID(uuidString: id)!))
        callback([false, result.description])
      } else {
        callback([true, String("no-transmission-mode")]) // throw error
      }
     
    } catch let error as BridgefyError {
      let errorCode: Int = getErrorCode(error: error)
      callback([true, String(errorCode)])
    } catch {
      // Unknown error occurred
      callback([true, String(-1)])
    }
  }
  
  // Get connected peers
  @objc func getConnectedPeers(
    _ callback: RCTResponseSenderBlock
  ) {
    guard let bridgefy = self.bridgefyInstance else {
      callback([true, "28"])
      return
    }
    
    let connectedPeers = bridgefy.connectedPeers
    var connectedPeersArray: [String] = []
    
    for peer in connectedPeers {
      connectedPeersArray.append(peer.description)
    }

    print("(swift-getConnectedPeers) Connected peers: \(connectedPeersArray)")
    
    callback([false, connectedPeersArray])
  }
  
  @objc func getUserId(
    _ callback: RCTResponseSenderBlock
  ) {
    guard let bridgefy = self.bridgefyInstance else {
      callback([true, "28"])
      return
    }
    
    let userId = bridgefy.currentUserId
    print("(swift-getUserId) User ID is \(userId)")
    callback([false, userId.description])
  }
}

class MyDelegate: BridgefyDelegate, ObservableObject {
  func bridgefyDidFailToStart(with error: BridgefySDK.BridgefyError) {
    let errorCode = getErrorCode(error: error)
    print("(swift-bridgefyDidFailToStart) Failed to start with error code \(errorCode)");
    
    RCTBridgefyModule.emitter.sendEvent(withName: "onFailedToStart", body: ["error": errorCode])
  }

  func bridgefyDidStart() {
    print("(swift-bridgefyDidStart) Started")
    
    RCTBridgefyModule.emitter.sendEvent(withName: "onDidStart", body: [])
  }

  func bridgefyDidConnect(with userID: UUID) {
    print("(swift-bridgefyDidConnect) Connected with user ID \(userID.description)")
    
    RCTBridgefyModule.emitter.sendEvent(withName: "onDidConnect", body: ["userID": userID.description])
  }

  func bridgefyDidDisconnect(from userID: UUID) {
    print("(swift-bridgefyDidDisconnect) Disconnected with user ID \(userID.description)")
    
    RCTBridgefyModule.emitter.sendEvent(withName: "onDidDisconnect", body: ["userID": userID.description])
  }

  func bridgefyDidSendMessage(with messageID: UUID) {
    print("(swift-bridgefyDidSendMessage) Sent message with message ID \(messageID.description)")
    print("(swift-bridgefyDidSendMessage) Send message debug: \(messageID.debugDescription)")
    
    RCTBridgefyModule.emitter.sendEvent(withName: "onMessageSent", body: ["messageID": messageID.description])
  }

  func bridgefyDidFailSendingMessage(with messageID: UUID, withError error: BridgefySDK.BridgefyError) {
    let errorCode = getErrorCode(error: error)
    print("(swift-bridgefyDidFailSendingMessage) Failed to send message with message ID: \(messageID.description) returning error code \(errorCode)")
    
    RCTBridgefyModule.emitter.sendEvent(withName: "onMessageSentFailed", body: ["messageID": messageID.description,"error": errorCode])
  }

  func bridgefyDidReceiveData(_ data: Data, with messageID: UUID, using transmissionMode: BridgefySDK.TransmissionMode) {
    print("(swift-bridgefyDidReceiveData) Received data: \(data.description) with message ID \(messageID.description) using transmission mode \(getTransmissionMode(transmisssionMode: transmissionMode))")
    
    let message = String(decoding: data, as: UTF8.self);
    var output: UUID = UUID(uuid: UUID_NULL);
    var transmissionModeString = "";
    
    if case let .p2p(i) = transmissionMode {
      transmissionModeString = "p2p";
      output = i;
    } else if case let .broadcast(i) = transmissionMode {
      transmissionModeString = "broadcast";
      output = i;
    } else if case let .mesh(i) = transmissionMode {
      transmissionModeString = "mesh";
      output = i;
    } 
    
    RCTBridgefyModule.emitter.sendEvent(withName: "onDidReceiveMessage", body: ["raw": message, "messageID": messageID.description, "contactID": output.description, "transmission": transmissionModeString])
  }

  func bridgefyDidStop() {
    print("(swift-bridgefyDidStop) Stopped")
    
    RCTBridgefyModule.emitter.sendEvent(withName: "onDidStop", body: [])
  }
  
  func bridgefyDidFailToStop(with error: BridgefyError) {
    let errorCode = getErrorCode(error: error)

    print("(swift-bridgefyDidFailToStop) Failed to start with error code \(errorCode)")
    
    RCTBridgefyModule.emitter.sendEvent(withName: "onDidFailToStop", body: ["error": errorCode])
  }
  
  func bridgefyDidEstablishSecureConnection(with userId: UUID) {
    print("(swift-bridgefyDidEstablishSecureConnection) Established secure connection with \(userId.description)")
    
    RCTBridgefyModule.emitter.sendEvent(withName: "onEstablishedSecureConnection", body: ["userID": userId.description])
  }
  
  func bridgefyDidFailToEstablishSecureConnection(with userId: UUID, error: BridgefyError) {
    let errorCode = getErrorCode(error: error)

    print("(swift-bridgefyDidFailToEstablishSecureConnection) Failed to establish secure connection with \(userId.description), returning error code \(errorCode)")
    
    RCTBridgefyModule.emitter.sendEvent(withName: "onFailedToEstablishSecureConnection", body: ["userID": userId.description, "error": errorCode])
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
  // This is not implemented by Bridgefy however it is important for us to have since it can be a reason that some methods fail
  // case .notInitialized: return(28)
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
