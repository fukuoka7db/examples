# ３日目：コンフリクトの解消とRiakの拡張

## ベクタークロックを使ったコンフリクトの解消
### ベクタークロックの理論
### 実践ベクタークロック

```
curl -X PUT http://localhost:10018/buckets/animals/keys \
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
 -H "X-Riak-Vclock: a85xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" \
 -H "Content-Type: application/json" \
 -d '{"score":2}'
```

```
curl -i -X PUT http://localhost:10018/buckets/animals/keys/bruiser \
 -H "X-Riak-ClientId: rakshith" \
 -H "X-Riak-Vclock: a85xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" \
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
curl -i -X PUT http://localhost:10018/buckets/animals/keys/bruiser \
 -H "X-Riak-ClientId: jane" \
 -H "X-Riak-Vclock: a85xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" \
 -H "Content-Type: application/json" \
 -d '{"score":3}'
```

### 時間の成長

```
curl http://localhost:10018/buckets/animals/keys
```

### 事前／事後コミットフック



## Riakの拡張
### Riakで全文検索



### Riakのインデックス





## ３日目の宿題・調べてみよう
### 1. Riak Function Contribのレポジトリを探してみよう（ヒント：GitHubにある）。


### 2.ベクタークロックについて調べてみよう。


### 3.自分のインデックスの設定方法を学んでみよう。


### ３日目の宿題・やってみよう
### 1.animals スキーマを定義するインデックスを作ってみよう。具体的には、整数型のscoreフィールドを設定して、範囲検索をしてみよう。

### 2.3つのサーバー(3台のノートパソコンやEC2インスタンスなど)にRiakをインストールして、小さなクラスタを作ってみよう。それから、Basho社のウェブサイトにあるGoogle株価データをインストールしてみよう。
