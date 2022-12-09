//
//  RCTBridgefySwift.swift
//  Hyperlocal
//
//  Created by Adrian Gri on 2022-11-03.
//

import Foundation
import BridgefySDK

@objc(RCTBridgefySwift) class RCTBridgefySwift: RCTEventEmitter {
  var apiKey = ProcessInfo.processInfo.environment["API_KEY"]!
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
      print(apiKey);
        try Bridgefy.manager.start(withAPIKey: apiKey, delegate: testDelegate)
        callback(["Success"])
    } catch {
        // Handle the error
        print("Error here");
        callback(["Error"])
    }
  }
  
  @objc func sendMessage(
    _ message: String,
    id: String,
    callback: RCTResponseSenderBlock
  ) {
    do {
      print("(swift-sendMessage) message: " + message + ", id: " + id);
      let result = try Bridgefy.manager.send(message.data(using: .utf8)!,
                                             using: BridgefySDK.TransmissionMode.p2p(userID: UUID(uuidString: id)!))
      callback([result.description])
    } catch {
      callback(["Error"])
    }
  }
}

class MyDelegate: BridgefyDelegate, ObservableObject {
    @Published var message = "";
    @Published var connectedUser = "";

    func bridgefyDidFailToStart(with error: BridgefySDK.BridgefyError) {
      print("(swift-bridgefyDidFailToStart) failed to start with " + error.localizedDescription);
      RCTBridgefySwift.emitter.sendEvent(withName: "onFailedToStart", body: [error.localizedDescription])
    }

    func bridgefyDidStart(with currentUserID: UUID) {
      print("(swift-bridgefyDidStart) started with user ID " + currentUserID.description);
      RCTBridgefySwift.emitter.sendEvent(withName: "onDidStart", body: [currentUserID.description])
    }

    func bridgefyDidConnect(with userID: UUID) {
      print("(swift-bridgefyDidConnect) connected with user ID " + userID.description)
      connectedUser = userID.description
      RCTBridgefySwift.emitter.sendEvent(withName: "onDidConnect", body: [userID.description])
    }

    func bridgefyDidDisconnect(from userID: UUID) {
      print("(swift-bridgefyDidDisconnect) disconnected with user ID " + userID.description)
      RCTBridgefySwift.emitter.sendEvent(withName: "onDidDisconnect", body: [userID.description])
    }

    func bridgefyDidSendMessage(with messageID: UUID) {
      print("(swift-bridgefyDidSendMessage) sent message with message ID " + messageID.description)
      print("(swift-bridgefyDidSendMessage) send message debug: " + messageID.debugDescription)
      RCTBridgefySwift.emitter.sendEvent(withName: "onMessageSent", body: [messageID.description])
    }

    func bridgefyDidFailSendingMessage(with messageID: UUID, withError error: BridgefySDK.BridgefyError) {
      print("(swift-bridgefyDidFailSendingMessage) failed to send message with message ID: " + messageID.description + " returning error " + error.localizedDescription)
      RCTBridgefySwift.emitter.sendEvent(withName: "onMessageSentFailed", body: [messageID.description + error.localizedDescription])
    }

    func bridgefyDidReceiveData(_ data: Data, with messageID: UUID, using transmissionMode: BridgefySDK.TransmissionMode) {
      print("(swift-bridgefyDidReceiveData) recieved data: " + data.description + " with message ID " + messageID.description + " using transmission mode " + "fix this")
      message = String(decoding: data, as: UTF8.self);
      var output: UUID = UUID(uuid: UUID_NULL);
      
      if case let .p2p(i) = transmissionMode {
        output = i;
      }
      
      RCTBridgefySwift.emitter.sendEvent(withName: "onDidRecieveMessage", body: [message, messageID.description, output.description])
    }


}
