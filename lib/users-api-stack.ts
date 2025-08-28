import * as cdk from "aws-cdk-lib";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import path from "path";
import * as apigateway from "aws-cdk-lib/aws-apigatewayv2";
import * as apigateway_integrations from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { DynamoDBStack } from "./dynamodb-stack";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

interface UsersApiStackProps extends cdk.StackProps {
  dynamodbStack: DynamoDBStack;
}

export class UsersApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: UsersApiStackProps) {
    super(scope, id, props);

    const userHandler = new NodejsFunction(this, "UserHandler", {
      runtime: Runtime.NODEJS_22_X,
      entry: path.join(__dirname, "../src/lambda/handler.ts"),
      handler: "handler",
      functionName: `${this.stackName}-user-handler`,
      environment: {
        TABLE_NAME: props.dynamodbStack.usersTable.tableName,
      },
    });

    props.dynamodbStack.usersTable.grantReadWriteData(userHandler);

    const httpApi = new apigateway.HttpApi(this, "UserApi", {
      apiName: "User API",
      description: "User Management API",
      corsPreflight: {
        allowOrigins: ["https://users-management-app-01.netlify.app"],
        allowMethods: [apigateway.CorsHttpMethod.ANY],
        allowHeaders: ["*"],
      },
    });

    const routes = [
      {
        path: "/users",
        method: apigateway.HttpMethod.GET,
        name: "GetAllUsers",
      },
      {
        path: "/users",
        method: apigateway.HttpMethod.POST,
        name: "CreateUser",
      },
      {
        path: "/users/{id}",
        method: apigateway.HttpMethod.GET,
        name: "GetUser",
      },
      {
        path: "/users/{id}",
        method: apigateway.HttpMethod.PUT,
        name: "UpdateUser",
      },
      {
        path: "/users/{id}",
        method: apigateway.HttpMethod.DELETE,
        name: "DeleteUser",
      },
    ];

    routes.forEach(({ path, method, name }) => {
      httpApi.addRoutes({
        path,
        methods: [method],
        integration: new apigateway_integrations.HttpLambdaIntegration(
          `${name}Integration`,
          userHandler
        ),
      });
    });

    new cdk.CfnOutput(this, "HttpApiUrl", {
      value: httpApi.url ?? "",
      description: "HTTP API URL",
    });
  }
}
