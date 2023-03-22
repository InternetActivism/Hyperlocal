
package com.hyperlocal.bridgefymodule

import com.facebook.react.bridge.*
import java.text.SimpleDateFormat
import java.util.*

import com.facebook.react.bridge.ReactMethod

class BridgefyModule(context: ReactApplicationContext) : ReactContextBaseJavaModule()
{
    @RequiresApi(Build.VERSION_CODES.O)
    @ReactMethod
    fun getCurrentTime(promise: Promise) {
        val date = ZonedDateTime.now( ZoneOffset.UTC ).format( DateTimeFormatter.ISO_INSTANT )
        promise.resolve(date)
    }

    override fun getName(): String {
        return "Clock"
    }
}