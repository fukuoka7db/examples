# ２日目：mapreduceとサーバークラスタ

## データ投入スクリプト

### 60

```
$ gem install riak-client json
```

``` hotel.rb
# generate loads and loads of rooms with random styles and capacities
require 'rubygems'
require 'riak'
STYLES = %w{single double queen king suite}

client = Riak::Client.new(:http_port => 10018)
bucket = client.bucket('rooms')
# Create 100 floors to the building
for floor in 1..100
  current_rooms_block = floor * 100
  puts "Making rooms #{current_rooms_block} - #{current_rooms_block + 100}"
  # Put 100 rooms on each floor (huge hotel!)
  for room in 1...100
    # Create a unique room number as the key
    ro = Riak::RObject.new(bucket, (current_rooms_block + room))
    # Randomly grab a room style, and make up a capacity
    style = STYLES[rand(STYLES.length)]
    capacity = rand(8) + 1
    # Store the room information as a JSON value
    ro.content_type = "application/json"
    ro.data = {'style' => style, 'capacity' => capacity}
    ro.store
  end
end
```

## mapreduce入門

## Riakのmapreduce
### 63

```
curl -X POST -H "content-type:application/json" \
http://localhost:10018/mapred --data @-
{
  "inputs":[
    ["rooms","101"],["rooms","102"],["rooms","103"]
  ],
  "query":[
    {"map":{
      "language":"javascript",
      "source":
        "function(v) {
          /* From the Riak object, pull data and parse it as JSON */
          var parsed_data = JSON.parse(v.values[0].data);
          var data = {};
          /* Key capacity number by room style string */
          data[parsed_data.style] = parsed_data.capacity;
          return [data];
        }"
    }}
  ]
}
```
Ctrl-D

### 64
#### ストアドファンクション

#### 組み込み関数

#### reduce

#### キーフィルタ

#### mapreduceでリンクウォーキング


## 整合性と永続性

#### Riakリング

#### ノード/書き込み/読み取り

#### 書き込みと永続性のある書き込み

#### 引き継ぎメモ

### 75

## ２日目の宿題・調べてみよう
### 1. Riakのmapreduceに関するオンラインドキュメントを読んでみよう。


### 2.Riakの関数のcontribレポジトリを探してみよう。事前にビルドされたmapreduce関数などが数多く存在する。


### 3.キーフィルタの一覧があるオンラインドキュメントを探してみよう。文字列のto_upper変換、ある範囲内の数値検索、レーベンシュタイン距離の文字列マッチ、論理演算（and/or/not）などがある。


### ２日目の宿題・やってみよう
### 1.roomsバケットに対して、階ごとに収容人数の合計値を求めるmapとreduceの関数を書いてみよう。


### 2.上記の関数を拡張して、42階と43階の部屋の収容人数を検索するフィルタを書いてみよう。

