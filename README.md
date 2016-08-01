# node-twelite

省電力無線モジュール[TWE-LITE](https://mono-wireless.com/jp/products/TWE-Lite-DIP/index.html)と通信するためのnode.jsモジュールです。
[MONOSTICK](https://mono-wireless.com/jp/products/MoNoStick/)をUSB接続した端末でnode-tweliteを使用することで、MONOSTICKで受信したTWE-LITEのデータを読み取ることができます。

node-tweliteは現時点で TWE-LITE 超簡単！TWEアプリ のデータフォーマットにのみ対応しています。

# Quick Start

```
npm install twelite --save
```

MONOSTICKをUSB接続した端末と、その端末と通信している[TWE-LITE DIP](https://mono-wireless.com/jp/products/TWE-Lite-DIP/index.html)などのモジュールがあるとします。
その端末上で以下を実行します。

`[USB PORT NAME]` はMONOSTICKのUSBポート名に置き換えてください。
OSXでは`/dev/tty.usbserial-*******`のようになります。

```javascript
'use strict';

var NodeTwelite = require('twelite');

var portName = '[USB PORT NAME]';
var twelite = new NodeTwelite(portName);

twelite.on('data', function(data) {
    console.log(data);
});
```

成功するとTWE-LITE DIPのデフォルト設定では1秒に一回通信データのオブジェクトがコンソールに表示されます。
データのパースについては [TWE-liteで簡単リモートなんとか～](http://qiita.com/Omegamega/items/b15bae4654f197ff9da8#%E7%9B%B8%E6%89%8B%E7%AB%AF%E6%9C%AB%E3%81%AE%E7%8A%B6%E6%85%8B%E9%80%9A%E7%9F%A5%E3%81%8B%E3%82%89%E9%9B%BB%E6%B3%A2%E5%BC%B7%E5%BA%A6%E3%81%A8%E9%9B%BB%E)を参考にさせていただきました。ありがとうございます。

# License

[MIT](https://github.com/bathtimefish/node-twelite/blob/master/LICENSE)
