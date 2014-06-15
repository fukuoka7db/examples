
### 50

make devrel

dev/dev1/bin/riak start
dev/dev2/bin/riak start
dev/dev3/bin/riak start


### 51

dev/dev2/bin/riak-admin join dev1@127.0.0.1
dev/dev3/bin/riak-admin join dev2@127.0.0.1

http://localhost:8091/stats


### 52

dev/dev2/bin/riak stop

curl http://localhost:8091/ping

curl -I http://localhost:8091/riak/no_bucket/no_key


### 53

curl -v -X PUT http://localhost:8091/riak/favs/db \
 -H "Content-Type: text/html" \
 -d "<html><body><h1>My new favorite DB is RIAK</h1></body></html>"

curl -v -X PUT http://localhost:8091/riak/animals/ace \
 -H "Content-Type: application/json" \
 -d '{"nickname" : "The Wonder Dog", "breed" : "German Shepherd"}'

curl -X GET http://localhost:8091/riak?buckets=true

curl -v -X PUT http://localhost:8091/riak/animals/polly?returnbody=true \
 -H "Content-Type: application/json" \
 -d '{"nickname" : "Sweet Polly Purebred", "breed" : "Purebred"}'


### 54

curl -i -X POST http://localhost:8091/riak/animals \
 -H "Content-Type: application/json" \
 -d '{"nickname" : "Sergeant Stubby", "breed" : "Terrier"}'

curl http://localhost:8091/riak/animals/xxxxxxxxxxxxxx

curl -i -X DELETE http://localhost:8091/riak/animals/xxxxxxxxxxxxxx

curl http://localhost:8091/riak/animals?keys=true


### 55

curl -X PUT http://localhost:8091/riak/cages/1 \
 -H "Content-Type: application/json" \
 -H "Link: </riak/animals/polly>; riaktag\"contains\"" \
 -d '{"room" : 101}'

curl -i http://localhost:8091/riak/animals/polly

curl -X PUT http://localhost:8091/riak/cages/2 \
 -H "Content-Type: application/json" \
 -H "Link: </riak/animals/ace>; riaktag\"contains\", </riak/cages/1>;riaktag=\"next_to\"" \
 -d '{"room" : 101}'


### 56

curl http://localhost:8091/riak/cages/1/_,_,_

curl http://localhost:8091/riak/cages/2/animals,_,_

curl http://localhost:8091/riak/cages/2/_,next_to,_


### 57

curl http://localhost:8091/riak/cages/2/_,next_to,0/animals,_,_

curl http://localhost:8091/riak/cages/2/_,next_to,1/_,_,_


### 58

curl -X PUT http://localhost:8091/riak/cages/1 \
 -H "Content-Type: application/json" \
 -H "X-Riak-Meta-Color: Pink" \
 -H "Link: </riak/animals/polly>; riaktag\"contains\"" \
 -d '{"room" : 101}'

curl -X PUT http://localhost:8091/riak/photos/polly.jpg \
 -H "Content-Type: image/jpeg" \
 -H "Link: </riak/animals/polly>; riaktag\"photo\"" \
 --data-binary @polly_image.jpg


### 59
### １日目の宿題・調べてみよう
### 1.Riakプロジェクトのオンラインドキュメントをブックマークして、REST APIのドキュメントを探してみよう。


### 2.ブラウザがサポートするMIMEタイプの一覧を探してみよう


### 3.Riakの設定ファイル（dev/dev1/etc/app.config）を読んで、ほかのdevの設定と見比べてみよう


### １日目の宿題・やってみよう
### 1.PUTを使って、animal/pollyをphoto/polly.jpgにリンクするように更新してみよう。


### 2.本書で使っていないMIMEタイプのファイルをPOSTして（例えばapplication/pdf）、生成されたキーを探してみよう。そしてそのURLをブラウザで開いてみよう。


### 3.新しいバケット「medicines」(薬)を作ってみよう。「antibiotics」（抗生物質）がキーになったJPEG画像（と適切なMIMEタイプ）をPUTしてみよう。それをAceという病気の子犬にリンクしてみよう。







