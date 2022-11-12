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
        callback(["startSDK func completed successfully"])
    } catch {
        // Handle the error
        print("Error here");
        callback(["Error thrown in startSDK"])
    }
  }
  
  @objc func sendMessage(
    _ message: String,
    id: String,
    callback: RCTResponseSenderBlock
  ) {
    do {
      print("message: " + message + ", id: " + id);
      let result = try Bridgefy.manager.send(message.data(using: .utf8)!,
                                             using: BridgefySDK.TransmissionMode.p2p(userID: UUID(uuidString: id)!))
      callback(["sendMessage result: " + result.description])
    } catch {
      callback(["Error thrown in sendMessage"])
    }
  }
}

class MyDelegate: BridgefyDelegate, ObservableObject {
    @Published var message = "";
    @Published var connectedUser = "";

    func bridgefyDidFailToStart(with error: BridgefySDK.BridgefyError) {
      print("failed to start with " + error.localizedDescription);
      RCTBridgefySwift.emitter.sendEvent(withName: "onFailedToStart", body: [error.localizedDescription])
    }

    func bridgefyDidStart(with currentUserID: UUID) {
      print("started with user ID " + currentUserID.description);
      RCTBridgefySwift.emitter.sendEvent(withName: "onDidStart", body: [currentUserID.description])
    }

    func bridgefyDidConnect(with userID: UUID) {
      print("connected with user ID " + userID.description)
      connectedUser = userID.description
      RCTBridgefySwift.emitter.sendEvent(withName: "onDidConnect", body: [userID.description])
    }

    func bridgefyDidDisconnect(from userID: UUID) {
      print("disconnected with user ID " + userID.description)
      RCTBridgefySwift.emitter.sendEvent(withName: "onDidDisconnect", body: [userID.description])
    }

    func bridgefyDidSendMessage(with messageID: UUID) {
      print("sent message with message ID " + messageID.description)
      print("send message debug: " + messageID.debugDescription)
      RCTBridgefySwift.emitter.sendEvent(withName: "onMessageSent", body: [messageID.description])
    }

    func bridgefyDidFailSendingMessage(with messageID: UUID, withError error: BridgefySDK.BridgefyError) {
      print("failed to send message with message ID: " + messageID.description + " returning error " + error.localizedDescription)
      RCTBridgefySwift.emitter.sendEvent(withName: "onMessageSentFailed", body: [messageID.description + error.localizedDescription])
    }

    func bridgefyDidReceiveData(_ data: Data, with messageID: UUID, using transmissionMode: BridgefySDK.TransmissionMode) {
      print("recieved data: " + data.description + " with message ID " + messageID.description + " using transmission mode " + "fix this")
      message = String(decoding: data, as: UTF8.self);
      RCTBridgefySwift.emitter.sendEvent(withName: "onDidRecieveMessage", body: [message, messageID.description])
    }


}
