# Device Provisioning Service with Node.js

## Set up SDK
Following steps for IoTHub SDK (https://github.com/Azure/autorest/blob/master/README.md#installing-autorest)
1. Install autorest `npm install -g autorest`.
2. Create Client Library for the [DPS REST API](https://docs.microsoft.com/en-us/rest/api/iot-dps/) `autorest --input-file=[path to API definition] --output-folder=.\device-sdk --verbose --nodejs --openapi-type=arm --add-credentials`

3. Make sure the `api-version` for the `requestUrl` in `runtimeRegistration.js' is 2017-11-15 

## X509 - Individual Enrollment

1. create a cert / key pair
```
openssl req -newkey rsa:2048 -nodes -x509 -keyout key.pem -out cert.pem -days 365 -config cert.cnf -subj "/C=US/ST=California/L=San Francis co/O=ACME, Inc./CN=YOURREGISTRATIONID/"
```

*Note* The common name `CN` *must* match the device registration.

2. Follow the steps 4-6 of _Create a device enrollment entry in the Device Provisioning Service_ in [Create and provision an X.509 simulated device using IoT Hub Device Provisioning Service](https://docs.microsoft.com/en-us/azure/iot-dps/quick-create-simulated-device-x509) to upload your cert.

3. Run the `runDevice.js' program 
```
node runDevice.js [Device Registration ID] [ID Scope] [Path to Cert] [Path to Key]
```

## X.509 - Group Enrollment

1. Create your certs running the `genCerts.sh` script and follow the steps from the [IoT Hub SDK] (https://github.com/Azure/azure-iot-sdk-c/blob/master/tools/CACertificates/CACertificateOverview.md)

2. Upload the cert.
![](2017-12-08-09-05-57.png)

3. Create an enrollment group
![](2017-12-08-09-08-10.png)

4. Run the `runDevice.js' program 
```
node runDevice.js [Device Registration ID] [ID Scope] [Path to Full Chain PEM] [Path to Key]
```

## Verify registration.

1. Navigate to the IoT Hub and locate the device under _IoT Devices_. Make sure the status is _enabled_
![](2017-12-08-08-45-46.png)

2. Invoke a Direct Method named YooHo
![](2017-12-08-08-47-16.png)

The node program should now exit.


## Acknowledgements 
Thank You to @amarzavery for pointers to the `CertificateCloudCredentials' and @simonporter for troubleshooting





