# ２日目：mapreduceとサーバークラスタ

## データ投入スクリプト

### 60

```
$ gem install riak-client json
```

hotel.rb
```
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

```
$ ruby hotel.rb
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

```
curl -X PUT -H "content-type:application/json" \
http://localhost:10018/buckets/my_function/keys/map_capacity --data @-
function(v) {
  var parsed_data = JSON.parse(v.values[0].data);
  var data = {};
  data[parsed_data.style] = parsed_data.capacity;
  return [data];
}
```

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
      "bucket":"my_function",
      "key":"map_capacity"
    }}
  ]
}
```

#### 組み込み関数

```
curl -X POST http://localhost:10018/mapred \
 -H "content-type:application/json" --data @-
{
  "inputs":[
    ["rooms","101"],["rooms","102"],["rooms","103"]
  ],
  "query":[
    {"map":{
      "language":"javascript",
      "name":"Riak.mapValueJson"
    }}
  ]
}
```

#### reduce

```
curl -X POST -H "content-type:application/json" \
http://localhost:10018/mapred --data @-
{
  "inputs":"rooms",
  "query":[
    {"map":{
      "language":"javascript",
      "bucket":"my_functions",
      "key":"map_capacity"
    }},
    {"reduce":{
      "language":"javascript",
      "source":
        "function(v) {
          var totals = {};
          for (var i in v) {
            for (var style in v[i]) {
              if ( totals[style] ) totals[style] += v[i][style];
              else                 totals[style] = v[i][style];
            }
          }
          return [totals];
        }"
    }}
  ]
}
```

#### キーフィルタ

```
curl -X POST -H "content-type:application/json" \
http://localhost:10018/mapred --data @-
{
  "inputs":{
    "bucket":"rooms",
    "key_filters":[["string_to_int"], ["less_than", 1000]]
  },
  "query":[
    {"map":{
      "language":"javascript",
      "bucket":"my_functions",
      "key":"map_capacity"
    }},
    {"reduce":{
      "language":"javascript",
      "source":
        "function(v) {
          var totals = {};
          for (var i in v) {
            for (var style in v[i]) {
              if ( totals[style] ) totals[style] += v[i][style];
              else                 totals[style] = v[i][style];
            }
          }
          return [totals];
        }"
    }}
  ]
}
```

#### mapreduceでリンクウォーキング

```
curl -X POST -H "content-type:application/json" \
http://localhost:10018/mapred --data @-
{
  "inputs":{
    "bucket":"cages",
    "key_filters":[["eq"], ["2"]]
  },
  "query":[
    {"link":{
      "bucket":"animals",
      "keep":false
    }},
    {"map":{
      "language":"javascript",
      "source":
        "function(v) { return [v]; }"
    }}
  ]
}
```

## 整合性と永続性

#### Riakリング

#### ノード/書き込み/読み取り

```
curl -X PUT http://localhost:10018/buckets/animals/keys \
 -H "Content-Type: application/json" \
 -d '{"props":{"n_val":4}}'
```

```
dev/dev3/bin/riak stop
```

```
curl -i http://localhost:10018/buckets/animals/keys/ace?r=all
```

#### 書き込みと永続性のある書き込み

```
curl -X PUT http://localhost:10018/buckets/animals/keys \
 -H "Content-Type: application/json" \
 -d '{"props":{"dw":"one"}}'
```

#### 引き継ぎメモ

### 75

## ２日目の宿題・調べてみよう
### 1. Riakのmapreduceに関するオンラインドキュメントを読んでみよう。


### 2.Riakの関数のcontribレポジトリを探してみよう。事前にビルドされたmapreduce関数などが数多く存在する。


### 3.キーフィルタの一覧があるオンラインドキュメントを探してみよう。文字列のto_upper変換、ある範囲内の数値検索、レーベンシュタイン距離の文字列マッチ、論理演算（and/or/not）などがある。


### ２日目の宿題・やってみよう
### 1.roomsバケットに対して、階ごとに収容人数の合計値を求めるmapとreduceの関数を書いてみよう。


### 2.上記の関数を拡張して、42階と43階の部屋の収容人数を検索するフィルタを書いてみよう。

