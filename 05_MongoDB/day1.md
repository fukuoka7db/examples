# １日目：CRUDとネスト

### 129

mongodコマンドでMongoサービスを起動するが、この場合データを保存するディレクトリが/data/dbとなる。

```
mongod --dbpath=hogehoge
```
で起動すると、hogehogeにデータを保存するため、後で消すような場合には楽。

## コマンドラインは楽しい

```
mongo book
```
新しいデータベースbookを作成し、MongoDB shell開始

```
> show dbs
admin  (empty)
local  0.078GB
```

データを入れるまでbookデータベースも存在しない

```
db.towns.insert({
 name: "New York",
 population: 22200000,
 last_census: ISODate("2009-07-31"),
 famous_for: [ "statue of liberty", "food" ],
 mayor : {
  name : "Michael Bloomberg",
  party : "I"
 }
})
```

```
> show dbs
admin  (empty)
book   0.078GB
local  0.078GB
```

bookにデータを投入したのでデータベースも作成された

### 130

```
> show collections
system.indexes
towns
```

存在するコレクションを確認できる

```
> db.towns.find()
{ "_id" : ObjectId("540d8d236a1617af4bb5c80d"),
 "name" : "New York",
 "population" : 22200000,
 "last_census" : ISODate("2009-07-31T00:00:00Z"),
 "famous_for" : [ "statue of liberty", "food" ],
 "mayor" : { "name" : "Michael Bloomberg", "party" : "I" }
}
```

find()コマンドでコレクションの中身を参照できる。
ObjectIdの"_id"フィールドは、タイムスタンプ、クライアントマシンID、クライアントプロセスID、インクリメンタルカウンタで構成。

## JavaScript
### 131

```
>db.help()
>db.towns.help()
>typeob db
object
>typeof db.tonws
object
>typeof db.tonws.insert
function
```

```
> db.towns.insert
```
引数や丸括弧無しだと関数のソースコードを見ることが出来る


#### code/mongo/insert_city.js
```
function insertCity(
  name, population, last_census,
  famous_for, mayor_info
) {
  db.towns.insert({
    name:name,
    population:population,
    last_census: ISODate(last_census),
    famous_for:famous_for,
    mayor : mayor_info
  });
}
```

### 132
```
> insertCity("Punxsutawney", 6200, '2008-01-31',
 ["phil the groundhog"], { name : "Jim Wehrle" }
)
```

```
> insertCity("Portland", 582000, '2007-09-20',
 ["phil the groundhog"], { name : "Jim Wehrle" }
)
```

## 読み取り：Mongoでもっと楽しく
```
db.towns.find({ "_id" : ObjectId("540d8e586a1617af4bb5c80e") })
```
find()関数に条件を指定することで、特定のドキュメントにアクセスできる

```
db.towns.find({ "_id" : ObjectId("540d8e586a1617af4bb5c80e") }, {name : true})
```
２つ目の引数で読み取るフィールドをフィルタできる

```
db.towns.find({ "_id" : ObjectId("540d8e586a1617af4bb5c80e") }, {name : false})
```
falseを指定すると、それ以外のフィールドを読み取る（上記ではname以外）

### 133

```
db.towns.find(
 { name : /^P/, population : { $lt : 10000 } },
 { name : 1, population : 1 }
)
```

条件を組み合わせる例。
最初の文字が「P」で始まり、人口が10000人未満の町の名前と人口を表示。
一つ目の条件は正規表現なので、「/^p/i」と書けば大文字小文字区別無し。

```
var population_range = {}
population_range['$lt'] = 1000000
population_range['$gt'] = 10000
db.towns.find(
 { name : /^P/, population : population_range },
 { name : 1 }
)
```

```
db.towns.find(
 { last_census : { $lte : ISODate('2008-01-31') } },
 { _id : 0, name : 1}
)
```

## 深く掘り下げる
### 134

```
db.towns.find(
 { famous_for : 'food' },
 { _id :0, name: 1, famous_for : 1}
)
```
戻りは、以下の通り
```
{ "name" : "New York", "famous_for" : [ "statue of liberty", "food" ] }
{ "name" : "Portland", "famous_for" : [ "beer", "food" ] }
```
famous_forの配列中に'food'を含むものが抽出される。

```
db.towns.find( { famous_for : ['food'] }, { _id :0, name: 1, famous_for : 1} )
```
だと結果無し。

```
db.towns.find(
 { famous_for : /statue/ },
 { _id :0, name: 1, famous_for : 1}
)
```
部分一致も可

```
db.towns.find( { famous_for : ['beer', 'food'] }, { _id :0, name: 1, famous_for : 1} )
```
この場合配列の完全一致

```
db.towns.find( { famous_for : { $all : ['food', 'beer'] } }, { _id :0, name: 1, famous_for : 1} )
```
$all演算子を付けると全マッチ

```
db.towns.find( { famous_for : { $nin : ['food', 'beer'] } }, { _id :0, name: 1, famous_for : 1} )
```
$nin演算子を付けるとマッチしないもの

```
db.towns.find(
 { 'mayor.party' : 'I' },
 { _id :0, name: 1, mayor : 1}
)
```
ネストした問い合わせには「.」を使う。

### 135

```
db.towns.find(
 { 'mayor.party' : { $exists : false } },
 { _id :0, name: 1, mayor : 1}
)
```
フィールドの存在確認に$exists演算子


## $elemMatch

```
db.countries.insert({
 _id : "us",
 name : "United States",
 exports : {
  foods : [
   { name : "bacon", tasty : true },
   { name : "burgers" }
  ]
 }
})
db.countries.insert({
 _id : "ca",
 name : "Canada",
 exports : {
  foods : [
   { name : "bacon", tasty : false },
   { name : "syrup", tasty : true }
  ]
 }
})
db.countries.insert({
 _id : "mx",
 name : "Mexico",
 exports : {
  foods : [
   { name : "salsa", tasty : true, condiment : true }
  ]
 }
})
db.countries.count()
```

### 136

```
db.countries.find(
 { 'exports.foods.name' : 'bacon', 'exports.foods.tasty' : true },
 { _id : 0, name : 1 }
)
```
上記を実行すると、"United States"と"Canada"が返ってくる。
おいしいベーコンを求めても、カナダがおいしくない「ベーコン」と「おいしい」シロップでマッチしてしまう。

```
db.countries.find(
 {
  'exports.foods' : {
   $elemMatch : {
    name : 'bacon',
    tasty : true
   }
  }
 },
 { _id : 0, name : 1 }
)
```
$elemMatchを使えばよい


```
db.countries.find( { 'exports.foods' : { $elemMatch : { name : 'bacon', tasty : true } } }, {_id:0} )[0]
```
戻ってきた配列にINDEXを指定すると結果が整形されて返ってくる

```
db.countries.find(
 {
  'exports.foods' : {
   $elemMatch : {
    tasty : true,
    condiment : { $exists : true }
   }
  }
 },
 { _id : 0, name : 1 }
)
```
$elemMatchの条件でも演算子使える

## ブール演算子

```
db.countries.find(
 { _id : "mx", name : "United States" },
 { _id : 1 }
)
```
暗黙のAND演算

### 137

```
db.countries.find(
 {
  'exports.foods' : {
   $or : {
    _id : "mx",
    name : "United States"
   }
  }
 },
 { _id : 1 }
)
```
$or演算子の明示

## 更新
### 138

```
db.towns.update(
 {_id : ObjectId("540d8ecf6a1617af4bb5c80f") },
 { $set : {"state" : "OR"}}
);
```
stateフィールドに "OR"を$setしている。
ここで$setを忘れると、ドキュメントの中身全部置き換えになる。注意。

```
db.towns.findOne({_id : ObjectId("540d8ecf6a1617af4bb5c80f")})
```
findOne()は一つのものを読み取る。結果は整形される。

```
db.towns.update(
 {　_id : ObjectId("540d8ecf6a1617af4bb5c80f") },
 { $inc : {population: 1000}　}
);
```
数値の加算も可能

### 139

## 参照
### 140
```
db.towns.update(
 { _id : ObjectId("540d8ecf6a1617af4bb5c80f") },
 { $set : { country: { $ref : "countries", $id : "us" } } }
)
```

```
var portland = db.towns.findOne({ _id : ObjectId("540d8ecf6a1617af4bb5c80f") })
db.counties.findOne({_id : portland.country.$id})
```

```
db[portland.country.$ref].findOne({_id:portland.country.$id})
```

## 削除

```
var bad_bacon = {
 'exports.foods' : {
  $elemMatch : {
   name: 'bacon',
   tasty : false
  }
 }
}
db.countries.find(bad_bacon)
db.countries.remove(bad_bacon)
```

### 141
## コードによる読み取り

```
db.towns.find(function() { return this.population > 6000 && this.population < 600000;})
```
実用上は問題があるとのこと

## １日目のまとめ

### 142

## １日目の宿題・調べてみよう
### 1.MongoDBのオンラインドキュメントをブックマークしてみよう。

### 2.Mongoの正規表現の書き方を調べてみよう。

### 3.コマンドラインのdb.helpとdb.collections.helpの出力を理解してみよう。

### 4.あなたが選んだプログラミング言語（Ruby・Java・PHP）などのMongoドライバを捜してみよう

### １日目の宿題・やってみよう
### 1.JSONドキュメント { "hello" : "world" }の中身を印字してみよう。

### 2.大文字小文字を区別しない正規表現を使って、文字列newが含まれる町を選択してみよう。

### 3.名前にeが含まれていてfoodかbeerで有名な市をすべて検索してみよう。

### 4.新しいデータベース「blogger」とコレクション「articles」を作ってみよう。新しい記事に作者の名前・メールアドレス・作成日・本文を挿入してみよう。

### 5.名前と本文を持つコメントの配列を記事に追加してみよう。

### 6.外部のJavaScriptファイルにあるクエリを実行してみよう。

