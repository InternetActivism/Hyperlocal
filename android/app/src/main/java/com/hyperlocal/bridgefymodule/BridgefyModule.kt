
package com.hyperlocal.bridgefymodule

import android.os.Build
import androidx.annotation.RequiresApi
import com.facebook.react.bridge.*
import java.util.*

import me.bridgefy.Bridgefy

import com.facebook.react.bridge.ReactMethod
import me.bridgefy.commons.exception.BridgefyException
import java.time.ZoneOffset
import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter

class BridgefyModule(context: ReactApplicationContext) : ReactContextBaseJavaModule()
{
    private val apiKey = "e259da26-3f8f-42c2-b354-a9fb9fa353e2"
    private var bridgefyInstance: Bridgefy? = null
    private val rContext: ReactApplicationContext = context


    @RequiresApi(Build.VERSION_CODES.O)
    @ReactMethod
    fun startSDK(callback: Callback) {
        println("(kotlin-startSDK) Starting SDK...")
        try {
            if (bridgefyInstance == null) {
                bridgefyInstance = Bridgefy(context=rContext)
                println("(kotlin-startSDK) Initialized SDK")
            }
            bridgefyInstance?.init(bridgefyApiKey = apiKey)
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
         is BridgefyException.ExpiredLicenseException -> 24
         is BridgefyException.UnknownException -> -1
     }
}