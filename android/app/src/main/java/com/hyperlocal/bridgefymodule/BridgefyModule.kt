
package com.hyperlocal.bridgefymodule

import android.os.Build
import androidx.annotation.RequiresApi
import com.facebook.react.bridge.*
import java.util.*

import com.facebook.react.bridge.ReactMethod
import java.time.ZoneOffset
import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter

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