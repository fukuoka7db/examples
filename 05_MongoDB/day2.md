# ２日目：インデックス・集約・mapreduce

### 143

code/mongo/populate_phone.js
```
populatePhones = function(area,start,stop) {
  for(var i=start; i < stop; i++) {
    var country = 1 + ((Math.random() * 8) << 0);
    var num = (country * 1e10) + (area * 1e7) + i;
    db.phones.insert({
      _id: num,
      components: {
        country: country,
        area: area,
        prefix: (i * 1e-4) << 0,
        number: i
      },
      display: "+" + country + " " + area + "-" + i
    });
  }
}
```

上記関数を実行し、結果を２件だけ確認する

```
populatePhones( 800, 5550000, 5650000 )
db.phones.find().limit(2)
```

インデックスを表示してみる

```
db.system.indexes.find()
```

### 144

"+1 800-5650001"は見つかるものを使うこと

```
db.phones.find({display: "+1 800-5650001"}).explain()
```

Bツリーインデックスを作成

```
db.phones.ensureIndex(
  { display : 1 },
  { unique : true, dropDups : true }
)
```
dropDupsは警告あり。
Specifying { dropDups: true } may delete data from your database. Use with extreme caution.


再度

```
db.phones.find({display: "+1 800-5650001"}).explain()
```

### 145

プロファイリングレベルを切り替えて再度find()し、system.profileコレクションを参照

```
db.setProfilingLevel(2)
db.phones.find({display: "+1 800-5650001"})
db.system.profile.find()
```

見やすく

```
db.system.profile.find({}, {op:1, query: 1, ts: 1, ns: 1, info: 1, millis: 1})
```

ネストした値にバックグラウンドでインデックスを作成

```
db.phones.ensureIndex({ "components.area" : 1 }, { background : 1 })
```

インデックスを参照

```
db.system.indexes.find({ "ns" : "book.phones" })
```

なお、インデックスの削除は・・・dropIndex

```
db.phones.dropIndex({display:1})
db.phones.getIndexes()
```

### 146

## 集約クエリ

```
db.phones.count({ "components.number" : { $gt : 5599999 } })
```

新たなエリアコードで100,000件追加

```
populatePhones( 855, 5550000, 5650000 )
```

distinct()コマンド

```
db.phones.distinct( "components.number", { "components.number" : { $lt : 5550005 } })
```

### 147

group()集約クエリ

```
db.phones.group({
  initial: { count:0 },
  reduce:  function(phone, output) { output.count++; },
  cond:    { "components.number" : { $gt : 5599999 } },
  key:     { "components.area" : true }
})
```

```
db.phones.group({
  initial: { count:0 },
  reduce:  function(phone, output) { output.count++; },
  cond:    { "components.number" : { $gt : 5599999 } }
})
```

### 148

finalize(out)を追加

```
db.phones.group({
  initial: { prefixes : {} },
  reduce:  function(phone, output) {
    output.prefixes[phone.components.prefix] = 1;
  },
  finalize: function(out) {
    var ary = [];
    for(var p in out.prefixes) { ary.push( parseInt( p ) ); }
    out.prefixes = ary;
  }
})[0].prefixes
```

## サーバーサイドコマンド

code/mongo/update_area.js
```
update_area = function() {
  db.phones.find().forEach(
    function(phone) {
      phone.components.area++;
      phone.display = "+"+
        phone.components.country+" "+
        phone.components.area+"-"+
        phone.components.number;
      db.phone.update({ _id : phone._id }, phone, false);
    }
  )
}
```

### 149

```
db.eval(update_area)
```

```
use admin
db.runCommand("top")
```

```
use book
db.listCommand()
```

```
db.runCommand({ "count" : "phones" })
```

```
db.phones.count
```

```
db.phones.find().count
```

### 150
## runCommand

```
db.runCommand
```

## 寄り道

```
db.system.js.save({
  _id:"getLast",
  value:function(collection) {
    return collection.find({}).sort({"_id":1}).limit(1)[0]
  }
})
```

```
db.eval("getLast(db.phones)")
```

### 151

```
db.system.js.findOne({"_id" : "getLast"}).value(db.phones)
```

## mapreduce（と finalize）

code/mongo/distinct_digits.js
```
distinctDigits = function(phone){
  var
    number = phone.components.number + '',
    seen = [],
    result = [],
    i = number.length;
  while(i--) {
    seen[+number[i]] = 1;
  }
  for (i=0; i<10; i++) {
    if (seen[i]) {
      result[result.length] = i;
    }
  }
  return result;
}
db.system.js.save({_id: 'distinctDigits', value: distinctDigits})
```

```
load("code/mongo/distinct_digits.js")
```

```
db.eval("distinctDigits(db.phones.findOne({ 'components.number' : 5551213 }))")
```

### 152

code/mongo/map_1.js
```
map = function() {
  var digits = distinctDigits(this);
  emit({digits : digits, country : this.components.country}, {count : 1});
}
```
```
load("code/mongo/map_1.js")
```


code/mongo/reduce_1.js
```
reduce = function(key, values) {
  var total = 0;
  for(var i=0; i < values.length; i++) {
    total += values[i].count;
  }
  return { count : total };
}
```
```
load("code/mongo/reduce_1.js")
```


```
results = db.runCommand({
  mapReduce: "phones",
  map:       map,
  reduce:    reduce,
  out:       "phones.report"
})
```

```
db.phones.report.find({"_id.country" : 8})
```

### 153

### 154

code/mongo/reduce_2.js
```reduce = function(key, values) {
  var total = 0;
  for(var i=0; i < values.length; i++) {
    var data = values[i];
    if('total' in data) {
      total += data.total;
    } else {
      total += data.count;
    }
  }
  return { total : total };
}
```

## ２日目のまとめ

## ２日目の宿題・調べてみよう
### 1.admin コマンドのショートカットを探してみよう。

### 2.クエリとカーソルのオンラインドキュメントを探してみよう。

### 3.MongoDB の mapreduce のドキュメントを探してみよう。

### 4.JavaScript インターフェイスを使って、help()・findOne()・stats() の３つの関数を調査してみよう。

### ２日目の宿題・やってみよう
### 1.カウントの合計値を出力する finalize() メソッドを実装してみよう。

### 2.あなたが選んだ言語のドライバをインストールして、データベースに接続してみよう。コレクションを作って、フィールドにインデックスを作成してみよう。


