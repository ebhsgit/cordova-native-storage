package com.eightbhs.nativestorage;

import android.app.Activity;
import android.content.SharedPreferences;

import com.eightbhs.core.util.cordova.BaseCordovaPlugin;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;

import java.io.UnsupportedEncodingException;
import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;
import java.util.Map;

import javax.crypto.BadPaddingException;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;

import by.chemerisuk.cordova.support.CordovaMethod;

public class NativeStorage extends BaseCordovaPlugin {
    public static final String TAG = "8bhsNativeStorage";

    public NativeStorage() {
    }

    private SharedPreferences getSharedPref(String storageName) {
        return cordova.getActivity().getSharedPreferences(storageName, Activity.MODE_PRIVATE);
    }

    @CordovaMethod(ExecutionThread.WORKER)
    protected void remove(String storageName, String ref, final CallbackContext callbackContext) {
        SharedPreferences.Editor editor = this.getSharedPref(storageName).edit();
        editor.remove(ref);
        boolean success = editor.commit();
        if (success) callbackContext.success();
        else callbackContext.error("Remove operation failed");
    }

    @CordovaMethod(ExecutionThread.WORKER)
    protected void clear(String storageName, final CallbackContext callbackContext) {
        SharedPreferences.Editor editor = this.getSharedPref(storageName).edit();
        editor.clear();
        boolean success = editor.commit();
        if (success) callbackContext.success();
        else callbackContext.error("Clear operation failed");
    }

    @CordovaMethod(ExecutionThread.WORKER)
    protected void putBoolean(String storageName, String ref, boolean bool, final CallbackContext callbackContext) {
        SharedPreferences.Editor editor = this.getSharedPref(storageName).edit();
        editor.putBoolean(ref, bool);
        boolean success = editor.commit();
        if (success) callbackContext.success(String.valueOf(bool));
        else callbackContext.error("Write failed");
    }

    @CordovaMethod(ExecutionThread.WORKER)
    protected void getBoolean(String storageName, String ref, final CallbackContext callbackContext) {
        SharedPreferences sharedPref = this.getSharedPref(storageName);
        Boolean bool = sharedPref.getBoolean(ref, false);
        callbackContext.success(String.valueOf(bool));
    }

    @CordovaMethod(ExecutionThread.WORKER)
    protected void putInt(String storageName, String ref, int anInt, final CallbackContext callbackContext) {
        SharedPreferences.Editor editor = this.getSharedPref(storageName).edit();
        editor.putInt(ref, anInt);
        boolean success = editor.commit();
        if (success) callbackContext.success(anInt);
        else callbackContext.error("Write failed");
    }

    @CordovaMethod(ExecutionThread.WORKER)
    protected void getInt(String storageName, String ref, final CallbackContext callbackContext) {
        SharedPreferences sharedPref = this.getSharedPref(storageName);
        int anInt = sharedPref.getInt(ref, -1);
        callbackContext.success(anInt);
    }

    @CordovaMethod(ExecutionThread.WORKER)
    protected void putDouble(String storageName, String ref, float f, final CallbackContext callbackContext) {
        SharedPreferences.Editor editor = this.getSharedPref(storageName).edit();
        editor.putFloat(ref, f);
        boolean success = editor.commit();
        if (success) callbackContext.success(Float.toString(f));
        else callbackContext.error("Write failed");
    }

    @CordovaMethod(ExecutionThread.WORKER)
    protected void getDouble(String storageName, String ref, final CallbackContext callbackContext) {
        SharedPreferences sharedPref = this.getSharedPref(storageName);
        float f = sharedPref.getFloat(ref, (float) -1.0);
        callbackContext.success(Float.toString(f));
    }

    @CordovaMethod(ExecutionThread.WORKER)
    protected void putString(String storageName, String ref, String aString, final CallbackContext callbackContext) {
        SharedPreferences.Editor editor = this.getSharedPref(storageName).edit();
        editor.putString(ref, aString);
        boolean success = editor.commit();
        if (success) callbackContext.success(aString);
        else callbackContext.error("Write failed");
    }

    @CordovaMethod(ExecutionThread.WORKER)
    protected void getString(String storageName, String ref, final CallbackContext callbackContext) {
        SharedPreferences sharedPref = this.getSharedPref(storageName);
        String s = sharedPref.getString(ref, "null");
        callbackContext.success(s);
    }

    @CordovaMethod(ExecutionThread.WORKER)
    protected void setItem(String storageName, String ref, String aString, final CallbackContext callbackContext) {
        this.putString(storageName, ref, aString, callbackContext);
    }

    @CordovaMethod(ExecutionThread.WORKER)
    protected void getItem(String storageName, String ref, final CallbackContext callbackContext) {
        SharedPreferences sharedPref = this.getSharedPref(storageName);
        String s = sharedPref.getString(ref, "nativestorage_null");
        if (s.equals("nativestorage_null")) {
            callbackContext.error(2);  // item not found
        }
        else callbackContext.success(s);
    }

    @CordovaMethod(ExecutionThread.WORKER)
    protected void setItemWithPassword(String storageName, String ref, String aString, String pwd, final CallbackContext callbackContext) {
        String ciphertext = "";
        try {
            ciphertext = Crypto.encrypt(aString, pwd);
        }
        catch (InvalidKeySpecException | NoSuchAlgorithmException | NoSuchPaddingException | InvalidAlgorithmParameterException | InvalidKeyException | UnsupportedEncodingException | BadPaddingException | IllegalBlockSizeException e) {
            e.printStackTrace();
            callbackContext.error(e.getMessage());
        }
        if (!ciphertext.equals("")) {
            SharedPreferences.Editor editor = this.getSharedPref(storageName).edit();
            editor.putString(ref, ciphertext);
            boolean success = editor.commit();
            if (success) callbackContext.success(aString);
            else callbackContext.error(1); //nativeWrite failed
        }
        else {
            callbackContext.error("Encryption failed");
        }
    }

    @CordovaMethod(ExecutionThread.WORKER)
    protected void getItemWithPassword(String storageName, String ref, String pwd, final CallbackContext callbackContext) throws Exception {
        SharedPreferences sharedPref = this.getSharedPref(storageName);
        String ciphertext = sharedPref.getString(ref, "nativestorage_null");
        if (ciphertext.equals("nativestorage_null")) {
            callbackContext.error(2);  // item not found
        }
        else {
            String plaintext = Crypto.decryptPbkdf2(ciphertext, pwd);
            callbackContext.success(plaintext);
        }
    }

    @CordovaMethod(ExecutionThread.WORKER)
    protected void keys(String storageName, final CallbackContext callbackContext) {
        SharedPreferences sharedPref = this.getSharedPref(storageName);
        Map<String, ?> allEntries = sharedPref.getAll();
        callbackContext.success(new JSONArray(allEntries.keySet()));
    }

    @CordovaMethod(ExecutionThread.WORKER)
    protected void contains(String storageName, String property, final CallbackContext callbackContext) {
        SharedPreferences sharedPref = this.getSharedPref(storageName);
        PluginResult result = new PluginResult(PluginResult.Status.OK, sharedPref.contains(property));
        callbackContext.sendPluginResult(result);
    }
}
