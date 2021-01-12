package com.eightbhs.nativestorage;

import android.app.Activity;
import android.content.SharedPreferences;
import android.util.Log;

import com.eightbhs.core.util.cordova.BaseCordovaPlugin;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaWebView;
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
    private SharedPreferences sharedPref;
    private SharedPreferences.Editor editor;

    public NativeStorage() {
    }

    public void initialize(CordovaInterface cordova, CordovaWebView webView) {
        super.initialize(cordova, webView);
        Log.v(TAG, "Init NativeStorage");
        String PREFS_NAME = preferences.getString("NativeStorageSharedPreferencesName", "NativeStorage");
        sharedPref = cordova.getActivity().getSharedPreferences(PREFS_NAME, Activity.MODE_PRIVATE);
        editor = sharedPref.edit();
    }

    @CordovaMethod(ExecutionThread.WORKER)
    protected void remove(String ref, final CallbackContext callbackContext) {
        editor.remove(ref);
        boolean success = editor.commit();
        if (success) callbackContext.success();
        else callbackContext.error("Remove operation failed");
    }

    @CordovaMethod(ExecutionThread.WORKER)
    protected void clear(final CallbackContext callbackContext) {
        editor.clear();
        boolean success = editor.commit();
        if (success) callbackContext.success();
        else callbackContext.error("Clear operation failed");
    }

    @CordovaMethod(ExecutionThread.WORKER)
    protected void putBoolean(String ref, boolean bool, final CallbackContext callbackContext) {
        editor.putBoolean(ref, bool);
        boolean success = editor.commit();
        if (success) callbackContext.success(String.valueOf(bool));
        else callbackContext.error("Write failed");
    }

    @CordovaMethod(ExecutionThread.WORKER)
    protected void getBoolean(String ref, final CallbackContext callbackContext) {
        Boolean bool = sharedPref.getBoolean(ref, false);
        callbackContext.success(String.valueOf(bool));
    }

    @CordovaMethod(ExecutionThread.WORKER)
    protected void putInt(String ref, int anInt, final CallbackContext callbackContext) {
        editor.putInt(ref, anInt);
        boolean success = editor.commit();
        if (success) callbackContext.success(anInt);
        else callbackContext.error("Write failed");
    }

    @CordovaMethod(ExecutionThread.WORKER)
    protected void getInt(String ref, final CallbackContext callbackContext) {
        int anInt = sharedPref.getInt(ref, -1);
        callbackContext.success(anInt);
    }

    @CordovaMethod(ExecutionThread.WORKER)
    protected void putDouble(String ref, float f, final CallbackContext callbackContext) {
        editor.putFloat(ref, f);
        boolean success = editor.commit();
        if (success) callbackContext.success(Float.toString(f));
        else callbackContext.error("Write failed");
    }

    @CordovaMethod(ExecutionThread.WORKER)
    protected void getDouble(String ref, final CallbackContext callbackContext) {
        float f = sharedPref.getFloat(ref, (float) -1.0);
        callbackContext.success(Float.toString(f));
    }

    @CordovaMethod(ExecutionThread.WORKER)
    protected void putString(String ref, String aString, final CallbackContext callbackContext) {
        editor.putString(ref, aString);
        boolean success = editor.commit();
        if (success) callbackContext.success(aString);
        else callbackContext.error("Write failed");
    }

    @CordovaMethod(ExecutionThread.WORKER)
    protected void getString(String ref, final CallbackContext callbackContext) {
        String s = sharedPref.getString(ref, "null");
        callbackContext.success(s);
    }

    @CordovaMethod(ExecutionThread.WORKER)
    protected void setItem(String ref, String aString, final CallbackContext callbackContext) {
        this.putString(ref, aString, callbackContext);
    }

    @CordovaMethod(ExecutionThread.WORKER)
    protected void getItem(String ref, final CallbackContext callbackContext) {
        String s = sharedPref.getString(ref, "nativestorage_null");
        if (s.equals("nativestorage_null")) {
            callbackContext.error(2);  // item not found
        }
        else callbackContext.success(s);
    }

    @CordovaMethod(ExecutionThread.WORKER)
    protected void setItemWithPassword(String ref, String aString, String pwd, final CallbackContext callbackContext) {
        String ciphertext = "";
        try {
            ciphertext = Crypto.encrypt(aString, pwd);
        }
        catch (InvalidKeySpecException | NoSuchAlgorithmException | NoSuchPaddingException | InvalidAlgorithmParameterException | InvalidKeyException | UnsupportedEncodingException | BadPaddingException | IllegalBlockSizeException e) {
            e.printStackTrace();
            callbackContext.error(e.getMessage());
        }
        if (!ciphertext.equals("")) {
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
    protected void getItemWithPassword(String ref, String pwd, final CallbackContext callbackContext) throws Exception {
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
    protected void keys(final CallbackContext callbackContext) {
        Map<String, ?> allEntries = sharedPref.getAll();
        callbackContext.success(new JSONArray(allEntries.keySet()));
    }
}
