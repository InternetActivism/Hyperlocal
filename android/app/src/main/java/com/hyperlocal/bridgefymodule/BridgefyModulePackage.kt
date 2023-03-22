package com.hyperlocal.bridgefymodule

import android.view.View
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ReactShadowNode
import com.facebook.react.uimanager.ViewManager
import java.util.*
import kotlin.collections.ArrayList

class BridgefyModulePackage : ReactPackage {
    override fun createViewManagers(reactContext: ReactApplicationContext):
            MutableList<ViewManager<View, ReactShadowNode<*>>>
    {
        return Collections.emptyList()
    }

    override fun createNativeModules(reactContext: ReactApplicationContext):
            MutableList<NativeModule>
    {
        val nativeModules = ArrayList<NativeModule>()
        nativeModules.add(SampleModule(reactContext))
        return nativeModules
    }
}