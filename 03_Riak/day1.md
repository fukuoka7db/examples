# １日目：CRUD・リンク・MIMEタイプ

### 50

```
make devrel
```

```
dev/dev1/bin/riak start
dev/dev2/bin/riak start
dev/dev3/bin/riak start
```

### 51

```
ulimit -n 4096
dev/dev2/bin/riak-admin cluster join dev1@127.0.0.1
dev/dev3/bin/riak-admin cluster join dev1@127.0.0.1
dev/dev1/bin/riak-admin cluster plan
dev/dev1/bin/riak-admin cluster commit
dev/dev1/bin/riak-admin member-status
```
[http://localhost:10018/stats](http://localhost:10018/stats)

dev/dev1/bin/riak-admin member-statusの結果、pendingがなくなっていればOK

### 52

```
dev/dev2/bin/riak stop
```


## RESTがベスト（あるいはcURL最高）

```
curl http://localhost:10018/ping
```

```
curl -I http://localhost:10018/buckets/no_bucket/keys/no_key
```

### 53

```
curl -v -X PUT http://localhost:10018/buckets/favs/keys/db \
 -H "Content-Type: text/html" \
 -d "<html><body><h1>My new favorite DB is RIAK</h1></body></html>"
```
[http://localhost:10018/buckets/favs/keys/db](http://localhost:10018/buckets/favs/keys/db)


## 値をバケットにPUTする

```
curl -v -X PUT http://localhost:10018/buckets/animals/keys/ace \
 -H "Content-Type: application/json" \
 -d '{"nickname" : "The Wonder Dog", "breed" : "German Shepherd"}'
```

```
curl -X GET http://localhost:10018/buckets?buckets=true
```

```
curl -v -X PUT http://localhost:10018/buckets/animals/keys/polly?returnbody=true \
 -H "Content-Type: application/json" \
 -d '{"nickname" : "Sweet Polly Purebred", "breed" : "Purebred"}'
```

### 54

```
curl -i -X POST http://localhost:10018/buckets/animals/keys \
 -H "Content-Type: application/json" \
 -d '{"nickname" : "Sergeant Stubby", "breed" : "Terrier"}'
```

```
curl http://localhost:10018/buckets/animals/keys/TgnLdWiyLpOgnWykp8la8H0xD42
```

```
curl -i -X DELETE http://localhost:10018/buckets/animals/keys/TgnLdWiyLpOgnWykp8la8H0xD42
```

```
curl http://localhost:10018/buckets/animals/keys?keys=true
```

## リンク

### 55

```
curl -X PUT http://localhost:10018/buckets/cages/keys/1 \
 -H "Content-Type: application/json" \
 -H "Link: </buckets/animals/keys/polly>; riaktag=\"contains\"" \
 -d '{"room" : 101}'
```

```
curl -i http://localhost:10018/buckets/animals/keys/polly
```

```
curl -X PUT http://localhost:10018/buckets/cages/keys/2 \
 -H "Content-Type: application/json" \
 -H "Link: </buckets/animals/keys/ace>; riaktag=\"contains\", </buckets/cages/keys/1>; riaktag=\"next_to\"" \
 -d '{"room" : 101}'
```

### 56

```
curl http://localhost:10018/buckets/cages/keys/1/_,_,_
```

```
curl http://localhost:10018/buckets/cages/keys/2/animals,_,_
```

```
curl http://localhost:10018/buckets/cages/keys/2/_,next_to,_
```

### 57

```
curl http://localhost:10018/buckets/cages/keys/2/_,next_to,0/animals,_,_
```

```
curl http://localhost:10018/buckets/cages/keys/2/_,next_to,1/_,_,_
```

### 58

```
curl -X PUT http://localhost:10018/buckets/cages/keys/1 \
 -H "Content-Type: application/json" \
 -H "X-Riak-Meta-Color: Pink" \
 -H "Link: </buckets/animals/keys/polly>; riaktag=\"contains\"" \
 -d '{"room" : 101}'
```

```
curl -i http://localhost:10018/buckets/cages/keys/1
```


## RiakにおけるMIMEタイプ

```
curl -X PUT http://localhost:10018/buckets/photos/keys/polly.jpg \
 -H "Content-Type: image/jpeg" \
 -H "Link: </buckets/animals/keys/polly>; riaktag=\"photo\"" \
 --data-binary @polly_image.jpg
```
[http://localhost:10018/buckets/photos/keys/polly.jpg](http://localhost:10018/buckets/photos/keys/polly.jpg)


### 59

## １日目の宿題・調べてみよう
### 1.Riakプロジェクトのオンラインドキュメントをブックマークして、REST APIのドキュメントを探してみよう。
[http://docs.basho.com](http://docs.basho.com)
[http://docs.basho.com/riak/latest/dev/references/apis/](http://docs.basho.com/riak/latest/dev/references/apis/)

### 2.ブラウザがサポートするMIMEタイプの一覧を探してみよう
[https://www.cs.tut.fi/~jkorpela/mimetypes.html](https://www.cs.tut.fi/~jkorpela/mimetypes.html)

### 3.Riakの設定ファイル（dev/dev1/etc/app.config）を読んで、ほかのdevの設定と見比べてみよう
```
diff dev/dev1/etc/app.config dev/dev2/etc/app.config
```

### １日目の宿題・やってみよう
### 1.PUTを使って、animal/pollyをphoto/polly.jpgにリンクするように更新してみよう。
```
curl -v -X PUT http://localhost:10018/buckets/animals/keys/polly \
 -H "Content-Type: application/json" \
 -H "Link:</buckets/photos/keys/polly.jpg>;riaktag=\"images\"" \
 -d '{"nickname" : "Sweet Polly Purebred", "breed" : "Purebred"}'
```
```
curl -i http://localhost:10018/buckets/animals/keys/polly
```

### 2.本書で使っていないMIMEタイプのファイルをPOSTして（例えばapplication/pdf）、生成されたキーを探してみよう。そしてそのURLをブラウザで開いてみよう。
```
curl -v -X PUT http://localhost:10018/buckets/pdf/keys/pdf.pdf \
 -H "Content-Type: application/pdf" \
 --data-binary @pdf.pdf
```
[http://localhost:10018/buckets/pdf/keys/pdf.pdf](http://localhost:10018/buckets/pdf/keys/pdf.pdf)

### 3.新しいバケット「medicines」(薬)を作ってみよう。「antibiotics」（抗生物質）がキーになったJPEG画像（と適切なMIMEタイプ）をPUTしてみよう。それをAceという病気の子犬にリンクしてみよう。
```
curl -v -X PUT http://localhost:10018/buckets/medicines/keys/antibiotics \
 -H "Content-Type: image/jpeg" \
 -H "Link: </buckets/animals/keys/ace>; riaktag=\"medicines\"" \
 --data-binary @antibiotics.jpg
```
```
curl http://localhost:10018/buckets/medicines/keys/antibiotics/_,_,_
```
