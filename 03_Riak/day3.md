# ３日目：コンフリクトの解消とRiakの拡張

## ベクタークロックを使ったコンフリクトの解消

セカンダリインデックスは遅くかつ負荷が高いので避けた方がよい。
Riakサーチも使うなとのこと（Bashoの人が言っていたそうな）。

### ベクタークロックの理論
### 実践ベクタークロック

```
curl -X PUT http://localhost:10018/buckets/animals/props \
 -H "Content-Type: application/json" \
 -d '{"props":{"allow_mult":true}}'
```

```
curl -i -X PUT http://localhost:10018/buckets/animals/keys/bruiser \
 -H "X-Riak-ClientId: bob" \
 -H "Content-Type: application/json" \
 -d '{"score":3}'
```

```
curl -i http://localhost:10018/buckets/animals/keys/bruiser?return_body=true
```

```
curl -i -X PUT http://localhost:10018/buckets/animals/keys/bruiser \
 -H "X-Riak-ClientId: jane" \
 -H "X-Riak-Vclock: a85hYGBgzGDKBVIcR4M2cgfPO8mZwZTImMfK0L7M6yxfFgA=" \
 -H "Content-Type: application/json" \
 -d '{"score":2}'
```

```
curl -i -X PUT http://localhost:10018/buckets/animals/keys/bruiser \
 -H "X-Riak-ClientId: rakshith" \
 -H "X-Riak-Vclock: a85hYGBgzGDKBVIcR4M2cgfPO8mZwZTImMfK0L7M6yxfFgA=" \
 -H "Content-Type: application/json" \
 -d '{"score":4}'
```

```
curl -i http://localhost:10018/buckets/animals/keys/bruiser?return_body=true
```

```
curl -i http://localhost:10018/buckets/animals/keys/bruiser?return_body=true\
 -H "Accept: multipart/mixed"
```

```
curl -i http://localhost:10018/buckets/animals/keys/bruiser?vtag=2MwmqvZBy1ejARHI28MWAh
```

下記のコンフリクト解消時のX-Riak-Vclockは上記で取得した値を使用する
```
curl -i -X PUT http://localhost:10018/buckets/animals/keys/bruiser?return_body=true \
 -H "X-Riak-ClientId: jane" \
 -H "X-Riak-Vclock: a85hYGBgzGDKBVIcR4M2cgfPO8mZwZTImsfKsHWl11m+LAA=" \
 -H "Content-Type: application/json" \
 -d '{"score":3}'
```

```
curl -i http://localhost:10018/buckets/animals/keys/bruiser?return_body=true
```

### 時間の成長

```
curl http://localhost:10018/buckets/animals/props
```

### 事前／事後コミットフック

dev/dev1/etc/app.configのjs_source_dirに指定したディレクトリに以下を配置

[https://github.com/fukuoka7db/examples/blob/master/03_Riak/my_validators.js](my_validators.js)

dev2、dev3にも実施

```
dev/dev1/bin/riak stop
dev/dev2/bin/riak stop
dev/dev3/bin/riak stop
dev/dev1/bin/riak start
dev/dev2/bin/riak start
dev/dev3/bin/riak start
```

```
$curl -i -X PUT http://localhost:10018/buckets/animals/props \
 -H "Content-Type: application/json" \
 -d '{"props":{"precommit":[{"name" : "good_score"}]}}'
```

```
$curl -i -X PUT http://localhost:10018/buckets/animals/keys/bruiser \
 -H "Content-Type: application/json" \
 -d '{"score":5}'
```

## Riakの拡張
### Riakで全文検索


```
$curl -i -X PUT http://localhost:10018/buckets/animals/props \
 -H "Content-Type: application/json" \
 -d '{"props":{"precommit":[{"mod" : "riak_search_kv_hook", "fun" : "precommit"}]}}'
```

```
$curl PUT http://localhost:10018/buckets/animals/props
```

```
$curl -i -X PUT http://localhost:10018/buckets/animals/keys/dragon \
 -H "Content-Type: application/json" \
 -d '{"nickname" : "Dragon", "breed" : "Briard", "score" : 1}'
$curl -i -X PUT http://localhost:10018/buckets/animals/keys/ace \
 -H "Content-Type: application/json" \
 -d '{"nickname" : "The Wonder Dog", "breed" : "German Shepherd", "score" : 3}'
$curl -i -X PUT http://localhost:10018/buckets/animals/keys/rtt \
 -H "Content-Type: application/json" \
 -d '{"nickname" : "Rin Tin Tin", "breed" : "German Shepherd", "score" : 4}'
```

```
$curl PUT http://localhost:10018/solr/animals/select?q=breed:Shepherd
```

```
$curl PUT http://localhost:10018/solr/animals/select \
?wt=json&q=nickname:Rin%20breed:Shepherd&q.op=and
```

### Riakのインデックス

```
$curl -i -X PUT http://localhost:10018/buckets/animals/keys/blue \
 -H "x-riak-index-mascot_bin: butler" \
 -H "x-riak-index-version_int: 2" \
 -d '{"nickname" : "Blue II", "breed" : "English Bulldog"}'
```

```
$curl PUT http://localhost:10018/buckets/animals/index/mascot_bin/butler
```


## ３日目の宿題・調べてみよう
### 1. Riak Function Contribのレポジトリを探してみよう（ヒント：GitHubにある）。


### 2.ベクタークロックについて調べてみよう。


### 3.自分のインデックスの設定方法を学んでみよう。


### ３日目の宿題・やってみよう
### 1.animals スキーマを定義するインデックスを作ってみよう。具体的には、整数型のscoreフィールドを設定して、範囲検索をしてみよう。

### 2.3つのサーバー(3台のノートパソコンやEC2インスタンスなど)にRiakをインストールして、小さなクラスタを作ってみよう。それから、Basho社のウェブサイトにあるGoogle株価データをインストールしてみよう。
