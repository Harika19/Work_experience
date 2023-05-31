download iam-test-2/aws-msk-iam-auth-1.1.3-all.jar

download iam-test-2/kafka_2.13-3.1.0



cmds:

DOCKER CMDS: MIRROR MAKER PROCESS:


[centos@ip-10-204-100-98] /storage/harika/kafka-connect-mm2/business-events-msk-mm2 (main)



docker ps -aqf "name=iamimage"

docker ps -aqf "name=iam-final2-test"


////////////
 docker build . -f Dockerfile -t iamimage1
docker run -d --name iamimage1-test iamimage1


docker run -d -p8083:8083 --name iamimage1-test iamimage1





$ cp -a iam-test/. iam-test-2/

./kafka_2.13-3.1.0/bin/connect-mirror-maker.sh ./mm2.properties



kafka-mm2-test-logs - cloud watch


sudo yum install maven


See history - history | grep run

docker ps|grep business-events-msk-mm2-test

docker image rm -f business-events-msk-mm2

docker container stop 659b56ca4c16

docker container rm 659b56ca4c16

docker build . -t business-events-msk-mm2  --no-cache (if needed)

docker run -d --name business-events-msk-mm2-test business-events-msk-mm2

docker run -d -p8083:8083 --name business-events-msk-mm2-test business-events-msk-mm2


Geo-replication:

docker build . -t aws-msk-mm2  --no-cache


docker run -d -p8083:8083 --name aws-msk-mm2-2 aws-msk-mm2

docker logs -f aws-msk-mm2-2



Test now:

docker build . -t aws-msk-iam --no-cache


docker run -d -p8083:8083 --name aws-msk-iam-test2 aws-msk-iam

docker logs -f aws-msk-iam-test2




aws kafka list-clusters --region=us-east-1

  aws kafka get-bootstrap-brokers --cluster-arn arn:aws:kafka:us-east-1:144505630525:cluster/business-events-POC/8125628c-2526-46e0-b3a0-e46fb82cfd36-17 --region=us-east-1


./kafka-topics.sh --list --zookeeper z-3.business-events-poc.hh7167.c17.kafka.us-east-1.amazonaws.com:2182,z-1.business-events-poc.hh7167.c17.kafka.us-east-1.amazonaws.com:2181,z-2.business-events-poc.hh7167.c17.kafka.us-east-1.amazonaws.com:2181


./kafka-topics.sh   --bootstrap-server localhost:9092 b-1.business-events-poc.hh7167.c17.kafka.us-east-1.amazonaws.com:9096,b-2.business-events-poc.hh7167.c17.kafka.us-east-1.amazonaws.com:9096 —list



./kafka-topics.sh --bootstrap-server b-1.business-events-poc.hh7167.c17.kafka.us-east-1.amazonaws.com:9096 --list


--authorizer kafka.security.auth.SimpleAclAuthorizer --authorizer-properties zookeeper.connect=z-3.business-events-poc.hh7167.c17.kafka.us-east-1.amazonaws.com:2182 --list





$ docker logs -f business-events-msk-mm2-test



b-2.business-events-poc.hh7167.c17.kafka.us-east-1.amazonaws.com:9096,b-1.business-events-poc.hh7167.c17.kafka.us-east-1.amazonaws.com:9096


b-2.be-test-1.v4t7ry.c24.kafka.us-east-1.amazonaws.com:9096,b-1.be-test-1.v4t7ry.c24.kafka.us-east-1.amazonaws.com:9096




$ docker exec -it business-events-msk-mm2-test sh
# ls
pom.xml  src  target
# cd target
# ls
classes  generated-sources  generated-test-sources  maven-archiver  maven-status  surefire-reports  test-classes
# cd /
# ls
bin  boot  dev	etc  home  lib	lib64  media  mnt  opt	proc  root  run  sbin  srv  sys  tmp  usr  var
# cd opt
# ls
Python-3.8.2	    connect-distributed.properties  get-pip.py        logs			  start-kafka-connect.sh
Python-3.8.2.tar.xz  dynatrace			    kafka_2.13-3.1.0  mirrormaker2-msk-migration
# cd kafka_2.13-3.1.0
# ls



Err:
[2022-04-22 18:50:56,226] INFO Opening socket connection to server INTERNAL_ZK_DNS/INTERNAL_IP. Will not attempt to authenticate using SASL (unknown error) (org.apache.zookeeper.ClientCnxn)



export ssh_cmd1=$(aws cloudformation describe-stacks  --stack-name --region=us-east-1
 $MSK_STACK --query 'Stacks[0].Outputs[?OutputKey==`SSHKafkaClientEC2Instance1`].OutputValue' --output text)


curl -X PUT -H "Content-Type: application/json" --data @mm2-msc.json http://localhost:8083/connectors/mm2-msc/config | jq '.'


curl -X PUT -H "Content-Type: application/json" --data @mm2-cpc.json http://localhost:8083/connectors/mm2-cpc/config  | jq .

curl -X PUT -H "Content-Type: application/json" --data @mm2-msc-cust-repl-policy-no-auth.json http://localhost:8083/connectors/mm2-msc/config | jq '.'

curl -X PUT -H "Content-Type: application/json" --data @mm2-cpc-cust-repl-policy-no-auth-sync.json http://localhost:8083/connectors/mm2-cpc/config  | jq .


curl -X PUT -H "Content-Type: application/json" --data @mm2-hbc.json http://localhost:8083/connectors/mm2-hbc/config | jq '.'











[centos@ip-10-204-100-94] /storage/harika/iam-test-2
$ ./kafka_2.13-3.1.0/bin/connect-mirror-maker.sh ./mm2.properties




History :

515  18/08/22 09:01:49docker ps -a | grep aws-msk-iam-test2
  516  18/08/22 09:02:02docker start 44b2290cc294
  517  18/08/22 09:02:14docker logs -f --tail=100 44b2290cc294
  518  18/08/22 09:05:57docker start 44b2290cc294
  519  18/08/22 09:05:59docker logs -f --tail=100 44b2290cc294
  520  18/08/22 09:08:06docker start 44b2290cc294
  521  18/08/22 09:08:08docker logs -f --tail=100 44b2290cc294
  522  18/08/22 09:12:32cat Dockerfile
  523  18/08/22 09:13:35vi mm2.properties
  524  18/08/22 09:14:55docker build . -t aws-msk-iam --no-cache
  525  18/08/22 09:15:27docker run -d -p8083:8083 --name aws-msk-iam-test3 aws-msk-iam
  526  18/08/22 09:15:34docker logs -f aws-msk-iam-test3
  527  18/08/22 09:17:21vi mm2.properties
  528  18/08/22 09:18:09docker build . -t aws-msk-iam --no-cache
  529  18/08/22 09:18:29docker run -d -p8083:8083 --name aws-msk-iam-test4 aws-msk-iam
  530  18/08/22 09:18:48docker logs -f aws-msk-iam-test4
  531  18/08/22 09:19:57cat dockerfile
  532  18/08/22 09:29:25cd
  533  18/08/22 09:29:33cd /storage/harika/
  534  18/08/22 09:29:34ls
  535  18/08/22 09:29:44git clone https://stash.es.ad.adp.com/scm/bus/business-events-mirror-maker.git
  536  18/08/22 09:30:04cd business-events-mirror-maker
  537  18/08/22 09:30:06ls
  538  18/08/22 09:36:30ditc up
  539  18/08/22 09:36:39k get pods|grep mirror
  540  18/08/22 10:33:58k logs -f business-events-mirror-maker-779b44c6-pd8m5
  541  18/08/22 10:34:04ls
  542  18/08/22 10:34:10cat docker-compose.yml
  543  18/08/22 10:34:18ditc up
  544  18/08/22 10:34:23k get pods|grep mirror
  545  18/08/22 10:34:37k logs -f business-events-mirror-maker-5bfb766c79-wt49f
  546  18/08/22 10:36:50cd
  547  18/08/22 10:36:51ls
  548  18/08/22 10:36:54cd ditc/
  549  18/08/22 10:37:10aws
  550  18/08/22 10:37:23aws list --profile BusinessEventsProducer
  551  18/08/22 10:38:29aws list-profiles
  552  18/08/22 10:39:20cd
  553  18/08/22 10:39:22aws list-profiles
  554  18/08/22 10:45:30cd /storage/harika/business-events-mirror-maker/
  555  18/08/22 10:45:31ls
  556  18/08/22 10:45:37cat dockerfile
  557  18/08/22 10:46:19docker pull docker.artifactory.us.caas.oneadp.com/lifion/core/nodejs-base
  558  18/08/22 10:46:28ditc up
  559  18/08/22 10:46:33k get pods|grep mirror
  560  18/08/22 10:46:40k logs -f business-events-mirror-maker-d4c6b8cd-q6lkg
  561  18/08/22 10:47:37docker build . -t 'business-events-mirror-maker'
  562  18/08/22 10:50:12docker run  -p 8080:8080 -e ENVIRONMENT='local' -e AWS_REGION='us-east-1' business-events-mirror-maker




History : CREATINGPROFILE IN DITC:

537  18/08/22 10:04:11aws
  538  18/08/22 10:04:23aws sts get-caller-identity
  539  18/08/22 10:06:16aws sts assume-role --role-arn "arn:aws:iam::144505630525:role/BusinessEventsProducerServiceIAMRole" --role-session-name AWSCLI-session
  540  18/08/22 10:06:50aws configure --help
  541  18/08/22 10:06:56aws configure help
  542  18/08/22 10:07:41aws configure --profile BusinessEventsProducer
  543  18/08/22 10:08:57cat ~/.aws/config
  544  18/08/22 10:09:05cat ~/.aws/credentials
  545  18/08/22 10:09:58vi ~/.aws/credentials
  546  18/08/22 10:10:47vi mm2.properties
  547  18/08/22 10:12:08 ./kafka_2.13-3.1.0/bin/connect-mirror-maker.sh ./mm2.properties
  548  18/08/22 10:12:37vi mm2.properties
  549  18/08/22 10:12:59 ./kafka_2.13-3.1.0/bin/connect-mirror-maker.sh ./mm2.properties
  550  18/08/22 10:14:21cat ~/.aws/credentials
  551  18/08/22 10:44:09history
![Uploading image.png…]()
