process.env.AWS_ACCESS_KEY_ID = AWS_ACCESS_KEY_ID // aws access key id for the specific env
process.env.AWS_SECRET_ACCESS_KEY = AWS_SECRET_ACCESS_KEY // aws secret key for the specific env
var aws = require("aws-sdk");
var cognitoidentityserviceprovider = new aws.CognitoIdentityServiceProvider({
  apiVersion: "2016-04-18",
  region: "us-east-1"
});

module.exports = function() {
  const email = process.argv[2]; // the admin user email
  const phone_number = process.argv[3]; // the admin user phone number
  const password = process.argv[4]; //password we want to set
  const userpoolId = userpoolId; // userpool id for the specific env
  const groupName = "Admin"; // name of the group

  let groupParams = {
    GroupName: groupName,
    UserPoolId: userpoolId,
    Description: "Administrative group"
  };
  cognitoidentityserviceprovider.createGroup(groupParams, function(err, data) {
    if (err) {
      console.log(err, err.stack);
    } else {
      let params = {
        UserPoolId: userpoolId,
        Username: email /* required */,
        DesiredDeliveryMediums: ["EMAIL"],
        MessageAction: "SUPPRESS",
        TemporaryPassword: "11111111A",
        UserAttributes: [
          {
            Name: "email",
            Value: email
          },
          {
            Name: "phone_number",
            Value: phone_number
          },
          {
            Name: "email_verified",
            Value: "True"
          },
          {
            Name: "phone_number_verified",
            Value: "True"
          }
        ]
      };
      cognitoidentityserviceprovider.adminCreateUser(params, function(
        err,
        data
      ) {
        if (err) {
          console.log(err, err.stack);
        } else {
          let params = {
            Password: password,
            UserPoolId: userpoolId,
            Username: email,
            Permanent: true
          };
          cognitoidentityserviceprovider.adminSetUserPassword(params, function(
            error,
            data
          ) {
            if (error) {
              console.log("error", error);
            } else {
              let params = {
                GroupName: groupName,
                UserPoolId: userpoolId,
                Username: email
              };
              cognitoidentityserviceprovider.adminAddUserToGroup(
                params,
                function(err, data) {
                  if (err) {
                    console.log(err, err.stack); // an error occurred
                  } else {
                    console.log(data); // successful response
                  }
                }
              );
            }
          });
        }
      });
    }
  });
};

module.exports();

//command to run
//node createAdmin.js "sangha@gmail.com" "+919563093567" "PassW0rd$"
