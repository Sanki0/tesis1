import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as vpc from 'aws-cdk-lib/aws-ec2';
import * as sagemaker from 'aws-cdk-lib/aws-sagemaker';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as emr from 'aws-cdk-lib/aws-emr';
import * as glue from 'aws-cdk-lib/aws-glue';
import * as dms from 'aws-cdk-lib/aws-dms';
import * as rds from 'aws-cdk-lib/aws-rds';

export class Tesis1Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC with only private subnets
    const vpc1 = new vpc.Vpc(this, 'VPC', {
      maxAzs: 2,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'vpc-main-p',
          subnetType: vpc.SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });

    // gateway endpoint to s3
    vpc1.addGatewayEndpoint('S3GatewayEndpoint', {
      service: vpc.GatewayVpcEndpointAwsService.S3,
    });

    // S3 bucket
    const bucket = new s3.Bucket(this, 'Bucket', {
      bucketName: 'tesis1-bucket-126244925242',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // sagemaker studio
    const sagemakerExecutionRole = new iam.Role(this, 'SagemakerExecutionRole', {
      assumedBy: new iam.ServicePrincipal('sagemaker.amazonaws.com'),
      roleName: 'sagemaker-execution-role',
      description: 'SageMaker Execution Role',
    });

    sagemakerExecutionRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSageMakerFullAccess'));
    sagemakerExecutionRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3FullAccess'));

    const app = new sagemaker.CfnDomain(this, 'SagemakerDomain', {
      authMode: 'IAM',
      domainName: 'tesis1-domain',
      defaultUserSettings: {
        executionRole: sagemakerExecutionRole.roleArn,
        securityGroups: ["sg-0354023da2130437e"],
      },
      subnetIds: ["subnet-0b57fd1fe1b6f6906"],
      vpcId: vpc1.vpcId,
      appNetworkAccessType: 'VpcOnly',
      defaultSpaceSettings: {
        executionRole: sagemakerExecutionRole.roleArn,
        securityGroups: ["sg-0354023da2130437e"],
      },
    });





  }
}
