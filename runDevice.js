'use strict;'

var fs = require('fs');
const azureCommon = require('azure-common');
const rest = require('ms-rest');
const model = require('./device-sdk/models');
const iotClient = require('azure-iot-device').Client;
const Protocol = require('azure-iot-device-mqtt').Mqtt;
const crypto = require('crypto');
const dpsClient = require('./device-sdk/deviceProvisioningServiceDeviceRuntimeClient.js')

var baseUrl = "https://global.azure-devices-provisioning.net"

process.argv.forEach(function (val, index, array) {
    console.log(index + ': ' + val);
  });

if( process.argv.length != 6 ) {
    console.log( "Usage: node runDevice.js [device registration id] [ID Scope] [PEM certpath] [PEM keypath] ");
    process.exit(1);
}

var deviceRegistrationId = process.argv[2];
var idScope = process.argv[3];
var certFile = process.argv[4]
var keyFile = process.argv[5]

var passphrase = ""
var state = 0;

console.log( "Registering Device " + deviceRegistrationId + " at DPS Instance " + idScope + " with cert " + certFile + " and key " + keyFile);

var requestbody = {
    registrationId: deviceRegistrationId,
}

var credObj = {
    subscriptionId: "a", // not used, but can't be empty
    cert: fs.readFileSync(certFile, 'utf-8').toString(),
    key : fs.readFileSync(keyFile, 'utf-8').toString(),
    pem: "" // has to be empty when cert and key properties are present.
}
  
var creds = new azureCommon.CertificateCloudCredentials(credObj);
var dps = new dpsClient(creds, baseUrl, null);

try {
    var result = dps.runtimeRegistration.registerDevice(deviceRegistrationId, requestbody, idScope, null, regCallback);
    console.log(result);
    state = 1;
}
catch (e) {
    console.log(e);
}

console.log('done');

function regCallback(err, result, req, resp) {
    if (err != null) {
        console.log(err);
    }
    else {
        console.log(resp);
        if( state == 1 )
        {
            var registration = JSON.parse( resp.body );
            // registration is of type RegistrationOperationStatus
            // Now check registration status
            dps.runtimeRegistration.deviceRegistrationStatusLookup( deviceRegistrationId, registration, idScope, null, regCallback )
            state = 2;
        }
        else if ( state == 2 )
        {
            // we should get a result of type RegistrationOperationStatus
            var opStatus = JSON.parse( resp.body );

            if( opStatus.status == 'assigned')
            {
                // once status is "assigned" then we have registration data
                var deviceId = opStatus.deviceId;
                var assignedHub = opStatus.assignedHub;
                const connectionString = `HostName=${assignedHub};DeviceId=${deviceId};x509=true`;
                
                // now let's connect to iothub
                client = iotClient.fromConnectionString(connectionString, Protocol);
                const options = {
                   cert: fs.readFileSync(certFile, 'utf-8').toString(),
                   key: fs.readFileSync(keyFile, 'utf-8').toString()
                 };
              
                client.setOptions(options);
                client.open((err) => {
                    if (!err) 
                    {
                        console.log(`device client connected for device ${deviceId}`)
                        console.log('Now listening to YooHoo command from IoTHub')
                        client.onDeviceMethod('YooHoo', onYoohoo);
                    }
                    else
                    {
                        console.log( 'Error opening IoT Hub Connection: ' + err.ToString());
                    }
                });

                status = 3;
            }
            else 
            {
                dps.runtimeRegistration.deviceRegistrationStatusLookup( deviceRegistrationId, opStatus, idScope, null, regCallback )                
            }
        }
        else
        {
            console.log('should not be here! ' + state)
            process.exit(1);
        }
    }
}

const onYoohoo= (request, response) => {
    console.log(request);
    process.exit(0);
}