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

## 相手端末の出力を変更する
相手端末の出力をUARTコマンドでコントロールする事ができます。UARTコマンドを送信することでTWELITE DIPの外部に接続したマイコン等で相手端末の出力を制御することができます。
詳細は[こちら](https://mono-wireless.com/jp/products/TWE-APPS/App_Twelite/step3-80.html)を参考してください。

コマンドは先頭文字がコロン（：）で終端はCR（0x0D）,LF（0x0A）です。
子機の論理デバイスIDが78（初期設定値）の例です。相手が親機の場合は00に、論理デバイスIDを変更している場合は78の代わりに設定した値を入力して下さい。

### データフォーマット
```
1: 1バイト : 宛先アドレス（論理デバイスID） (0x00: 親機, 0x01 ～ 0x64: 子機ID指定, 0x78: 全子機) 親機から子機、または子機から親機への伝送に限ります。
2: 1バイト : コマンド番号 (0x80 固定)
3: 1バイト : 書式バージョン (0x01 固定, 将来のための拡張)
4: 1バイト : IO状態 b7..b3b2b1b0とした場合 b0/b1/b2/b3 が DO1/DO2/DO3/DO4)の設定値となり、0がHi、1がLoとなります。設定を有効化するために、続く IO状態マスクのビットがを1に設定します。
5: 1バイト : IO状態設定マスク b7..b3b2b1b0とした場合 b0/b1/b2/b3 が DO1/DO2/DO3/DO4)の設定値となり、0で対応するDOを設定しない、1で設定します。
6: 2バイト : PWM1の設定値 0(0%)～1024(100%)または0xFFFF(設定しない)を与えます。
7: 2バイト : PWM2の設定値
8: 2バイト : PWM3の設定値
9: 2バイト : PWM4の設定値
10:1バイト : チェックサム
```

### DOをオンにする
```
:7880010F0F0000000000000000E9　（DO1、DO2、DO3、DO4全てをオンにする）
:7880010101000000000000000005　（DO1のみを制御対象にしてオンにする）
:78800104040000000000000000FF　（DO3のみを制御対象にしてオンにする）
:78800105050000000000000000FD　（DO1、DO3のみを制御対象にしてオンにする）
```

### DOをオフにする
```
:788001000F0000000000000000F8　（DO1、DO2、DO3、DO4全てをオフにする）
:7880010001000000000000000006　（DO1のみを制御対象にしてオフにする）
:7880010004000000000000000003　（DO3のみを制御対象にしてオフにする）
:7880010005000000000000000002　（DO1、DO3のみを制御対象にしてオフにする）
```

### PWMの値を変える
```
:7880010000000000000000000007　（PWM１、PWM2、PWM3、PWM4全てを最小値0にする）
:78800100000400040004000400F7　（PWM１、PWM2、PWM3、PWM4を最大値1024にする）
:78800100000400FFFFFFFFFFFF09　（PWM１のみを制御対象にして出力を最大値1024にする）
:7880010000FFFF0400FFFFFFFF09　（PWM2のみを制御対象にして出力を最大値1024にする）
:7880010000FFFFFFFF0400FFFF09　（PWM4のみを制御対象にして出力を最大値1024にする）
:7880010000FFFFFFFFFFFF040009　（PWM１のみを制御対象にして出力を最大値1024に###
```

### チェックサムの計算方法
データ部の各バイトの和を８ビット幅で計算し２の補数をとります。つまりデータ部の各バイトの総和＋チェックサムバイトを８ビット幅で計算すると０になります。
チェックサムバイトをアスキー文字列２文字で表現します。
例えば 00A01301FF123456 では 0x00 + 0xA0 + ... + 0x56 = 0x4F となり、この二の補数は0xB1 です。（つまり 0x4F + 0xB1 = 0）

### チェックサムの省略
チェックサムを省略し替わりに X を入力できます。

`例 :780100112233X`

### 相手端末出力の変更例
```javascript
'use strict';

var NodeTwelite = require('twelite');

var portName = '[USB PORT NAME]';
var twelite = new NodeTwelite(portName);

// TWE-LITEコマンド
var TWECMD_DOALLON = ':7880010F0F0000000000000000E9\r\n'; // 　（DO1、DO2、DO3、DO4全てをオンにする）
var TWECMD_DO1ON   = ':7880010101000000000000000005\r\n'; // 　（DO1のみを制御対象にしてオンにする）
var TWECMD_DO3ON   = ':78800104040000000000000000FF\r\n'; // 　（DO3のみを制御対象にしてオンにする）
var TWECMD_DO13ON  = ':78800105050000000000000000FD\r\n'; // 　（DO1、DO3のみを制御対象にしてオンにする）
var TWECMD_DOALLOFF = ':788001000F0000000000000000F8\r\n'; //　（DO1、DO2、DO3、DO4全てをオフにする）
var TWECMD_DO1OFF  = ':7880010001000000000000000006\r\n'; //　 （DO1のみを制御対象にしてオフにする）
var TWECMD_DO3OFF  = ':7880010004000000000000000003\r\n'; //　 （DO3のみを制御対象にしてオフにする）
var TWECMD_DO13OFF = ':7880010005000000000000000002\r\n'; //　 （DO1、DO3のみを制御対象にしてオフにする）

twelite.write(TWECMD_DO1ON, function(err, results) {
    console.log('err ' + err);
    console.log('results ' + results);
});

```

# License

[MIT](https://github.com/bathtimefish/node-twelite/blob/master/LICENSE)
