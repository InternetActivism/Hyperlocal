
package com.hyperlocal.bridgefymodule

import android.os.Build
import androidx.annotation.RequiresApi
import com.facebook.react.bridge.*
import java.util.*

import me.bridgefy.Bridgefy

import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule
import me.bridgefy.commons.TransmissionMode
import me.bridgefy.commons.exception.BridgefyException
import me.bridgefy.commons.listener.BridgefyDelegate

class BridgefyModule(context: ReactApplicationContext) : ReactContextBaseJavaModule()
{
    private val apiKey = UUID.fromString("e259da26-3f8f-42c2-b354-a9fb9fa353e2")
    private var bridgefyInstance: Bridgefy? = null
    private val rContext: ReactApplicationContext = context

    private val delegate: BridgefyDelegate = object : BridgefyDelegate {

        override fun onFailToStart(error: BridgefyException) {
            val errorCode = getErrorCode(error)
            val body: WritableMap = Arguments.createMap().apply {
                putInt("error", errorCode)
            }
            println("(kotlin-onFailToStart) Failed to start with error code $errorCode")
            sendEvent(rContext, "onFailedToStart", body)
        }

        override fun onStarted(userID: UUID) {
            val body: WritableMap = Arguments.createMap()

            println("(kotlin-onStarted) Started")
            sendEvent(rContext, "onDidStart", body)
        }

        override fun onConnected(userID: UUID) {
            val body: WritableMap = Arguments.createMap().apply {
                putString("userID", userID.toString())
            }

            println("(kotlin-onConnected) Connected with user ID $userID")
            sendEvent(rContext, "onDidConnect", body)
        }

        override fun onDisconnected(userID: UUID) {
            val body: WritableMap = Arguments.createMap().apply {
                putString("userID", userID.toString())
            }

            println("(kotlin-onDisconnected) Disconnected with user ID $userID")
            sendEvent(rContext, "onDidDisconnect", body)
        }

        override fun onSend(messageID: UUID) {
            val body: WritableMap = Arguments.createMap().apply {
                putString("messageID", messageID.toString())
            }

            println("(kotlin-onSend) Sent message with message ID $messageID")
            sendEvent(rContext, "onMessageSent", body)
        }

        //in the iOS SDK, this also gets passed a BridgefyException
        override fun onFailToSend(messageID: UUID) {
            val body: WritableMap = Arguments.createMap().apply {
                putString("messageID", messageID.toString())
            }

            println("(kotlin-onFailToSend) Failed to send message with message ID $messageID")
            sendEvent(rContext, "onMessageSentFailed", body)
        }

        override fun onReceive(data: ByteArray, messageID: UUID, transmissionMode: TransmissionMode) {
            val message = String(data, Charsets.UTF_8)
            var senderOrReceiver: UUID = UUID(0, 0)
            var transmissionModeString = ""

            when (transmissionMode) {
                is TransmissionMode.P2P -> {
                    transmissionModeString = "p2p"
                    senderOrReceiver = transmissionMode.receiver
                }
                is TransmissionMode.Broadcast -> {
                    transmissionModeString = "broadcast"
                    senderOrReceiver = transmissionMode.sender
                }
                is TransmissionMode.Mesh -> {
                    transmissionModeString = "mesh"
                    senderOrReceiver = transmissionMode.receiver
                }
            }

            val body: WritableMap = Arguments.createMap().apply {
                putString("contactID", senderOrReceiver.toString())
                putString("messageID", messageID.toString())
                putString("raw", message)
                putString("transmission", transmissionModeString)
            }

            println("(kotlin-onReceive) Received data: $message with $messageID using transmission mode ${getTransmissionMode(transmissionMode)}")
            sendEvent(rContext, "onDidReceiveMessage", body)
        }

        override fun onStopped() {
            val body: WritableMap = Arguments.createMap()

            println("(kotlin-onStopped) Stopped")
            sendEvent(rContext, "onDidStop", body)
        }

        override fun onFailToStop(error: BridgefyException) {
            val errorCode = getErrorCode(error)
            val body: WritableMap = Arguments.createMap().apply {
                putInt("error", errorCode)
            }

            println("(kotlin-onFailToStop) Failed to stop with error code $errorCode")
            sendEvent(rContext, "onFailedToStop", body)
        }

        override fun onConnectedSecurely(userID: UUID) {
            val body: WritableMap = Arguments.createMap().apply {
                putString("userID", userID.toString())
            }

            println("(kotlin-onConnectedSecurely) Established secure connection with $userID")
            sendEvent(rContext, "onDidConnectSecurely", body)
        }

        override fun onProgressOfSend(messageID: UUID, position: Int, of: Int) {
            // TODO, implement this properly
            println("(kotlin-onProgressOfSend) messageID: $messageID, position: $position, of: $of")
        }
    }



    @RequiresApi(Build.VERSION_CODES.O)
    @ReactMethod
    fun startSDK(callback: Callback) {
        println("(kotlin-startSDK) Starting SDK...")
        try {
            if (bridgefyInstance == null) {
                bridgefyInstance = Bridgefy(context=rContext)
                println("(kotlin-startSDK) Initialized SDK")
            }
            bridgefyInstance?.init(bridgefyApiKey = apiKey, delegate = delegate)
            callback.invoke(false, "Success")
        } catch (error: BridgefyException) {
            val errorCode: Int = getErrorCode(error)
            println("(kotlin-startSDK) Failed to initialize Bridgefy instance with error code $errorCode: $error")
            callback.invoke(true, errorCode.toString())
        } catch (error: Exception) {
            // Unknown error occurred
            println("(kotlin-startSDK) Failed to initialize Bridgefy instance with unknown error code")
            callback.invoke(true, "-1")
        }
    }

    @RequiresApi(Build.VERSION_CODES.O)
    @ReactMethod
    fun stopSDK(callback: Callback) {
        println("(kotlin-stopSDK) Stopping SDK...")
        val bridgefy = this.bridgefyInstance

        if (bridgefy == null) {
            callback(true, "28")
            return
        }

        bridgefy.stop()
        callback.invoke(false, "Success")
    }

    @RequiresApi(Build.VERSION_CODES.O)
    @ReactMethod
    fun sendMessage(message: String, id: String, transmissionMode: String, callback: Callback) {
        try {
            println("(kotlin-sendMessage) Message: $message, id: $id")

            val bridgefy = bridgefyInstance
            if (bridgefy == null) {
                callback.invoke(true, "28")
                return
            }

            when (transmissionMode) {
                "p2p" -> {
                    val result = bridgefy.send(message.toByteArray(Charsets.UTF_8),
                        TransmissionMode.P2P(UUID.fromString(id)))
                    callback.invoke(false, result.toString())
                }
                "mesh" -> {
                    val result = bridgefy.send(message.toByteArray(Charsets.UTF_8),
                        TransmissionMode.Mesh(UUID.fromString(id)))
                    callback.invoke(false, result.toString())
                }
                "broadcast" -> {
                    val result = bridgefy.send(message.toByteArray(Charsets.UTF_8),
                        TransmissionMode.Broadcast(UUID.fromString(id)))
                    callback.invoke(false, result.toString())
                }
                else -> {
                    callback.invoke(true, "no-transmission-mode")
                }
            }
        } catch (error: BridgefyException) {
            val errorCode = getErrorCode(error)
            callback.invoke(true, errorCode.toString())
        } catch (error: Exception) {
            callback.invoke(true, "-1")
        }
    }

    @ReactMethod
    fun getUserId(callback: Callback) {
        val bridgefy = bridgefyInstance
        if (bridgefy == null) {
            callback.invoke(true, "28")
            return
        }

        val userId = bridgefy.currentBridgefyUser()

        if(userId == null){
            callback.invoke(true, "28")
            return
        }

        println("(kotlin-getUserId) User ID: $userId")

        callback.invoke(false, userId.toString())
    }


    //TODO: add getConnectedPeers

    @ReactMethod
    fun updateLicense(callback: Callback){
        val bridgefy = bridgefyInstance
        if (bridgefy == null) {
            callback.invoke(true, "28")
            return
        }

        bridgefy.updateLicense()
        callback.invoke(false, "Success")
    }

    @ReactMethod
    fun establishSecureConnection(userID: String, callback: Callback){
        val bridgefy = bridgefyInstance
        if (bridgefy == null) {
            callback.invoke(true, "28")
            return
        }

        bridgefy.connectSecurely(userId = UUID.fromString(userID))
        callback.invoke(false, "Success")
    }

    private fun sendEvent(
        reactContext: ReactContext,
        eventName: String,
        params: WritableMap
    ) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    @ReactMethod
    fun addListener(eventName: String?) {
// Keep: Required for RN built in Event Emitter Calls.
    }
    @ReactMethod
    fun removeListeners(count: Int?) {
// Keep: Required for RN built in Event Emitter Calls.
    }

    override fun getName(): String {
        return "BridgefyModule"
    }

}


// returns an error number from 1 to 28 that maps to an error that we can handle/support
// not exhaustive because Bridgefy Swift SDK has more errors, but we do our best to map
fun getErrorCode(exception: BridgefyException): Int{
     return when(exception) {
         is BridgefyException.SimulatorIsNotSupportedException -> 0
         is BridgefyException.RegistrationException -> 1 // this maps to notStarted in Swift
         is BridgefyException.AlreadyStartedException -> 4
         is BridgefyException.MissingApplicationIdException -> 6
         is BridgefyException.InvalidAPIKeyFormatException -> 7
         is BridgefyException.InternetConnectionRequiredException -> 8
         is BridgefyException.SessionErrorException -> 9
         is BridgefyException.ExpiredLicenseException -> 10
         is BridgefyException.InconsistentDeviceTimeException -> 11
         is BridgefyException.PermissionException -> 12 // this maps to BLEUsageNotGrantedException in Swift
         is BridgefyException.DeviceCapabilitiesException -> 15 // this maps to BLEUnsupported in Swift
         is BridgefyException.SizeLimitExceededException -> 20
         is BridgefyException.GenericException -> 23 // this maps to internalError in Swift
         is BridgefyException.UnknownException -> -1
     }
}

fun getTransmissionMode(transmissionMode: TransmissionMode): String {
    return when (transmissionMode) {
        is TransmissionMode.Broadcast -> "broadcast"
        is TransmissionMode.P2P -> "p2p"
        is TransmissionMode.Mesh -> "mesh"
    }
}