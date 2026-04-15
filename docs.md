ODPT Logo
公共交通オープンデータセンター開発者サイト
The Developer Site for ODPT
公開データの詳細
規約・ガイドライン
ニュース
API仕様
APIに関する補足
FAQ
フォーラム
API仕様
公共交通オープンデータセンター API仕様
公共交通オープンデータ協議会
info@odpt.org
version 4.15,
2025-11-28
目次
1. 概要
1.1. 概要
1.2. 提供するデータ
1.3. インターフェース
1.4. データ検索API (/v4/RDF_TYPE?)
1.5. データダンプAPI (/v4/RDF_TYPE.json?)
1.6. データ取得API (GET /v4/datapoints/$DATA_URI)
1.7. 地物情報検索API (/v4/places/RDF_TYPE?)
2. 共通クラス
2.1. 概要
2.2. パス
2.3. 定義
3. ODPT Train API
3.1. 概要
3.2. パス
3.3. 定義
4. ODPT Bus API
4.1. 概要
4.2. パス
4.3. 定義
5. ODPT Airplane API
5.1. 概要
5.2. パス
5.3. 定義
6. ODPT File API
6.1. 概要
6.2. パス
7. 付録::RDF及びJSON-LDについて
7.1. URI (Uniform Resource Identifier)
7.2. RDF (Resource Description Framework)
7.3. RDF Schema
7.4. ボキャブラリ
7.5. RDFの記述方法
7.6. Linked Data
7.7. JSON-LD
8. 更新履歴
1. 概要
公共交通オープンデータセンターAPI（以下、本API）では、鉄道、バス、航空機の情報を提供する。

1.1. 概要
本APIで扱う公共交通機関とは、不特定多数の人々が利用する交通機関を指す。 具体的に本APIではこの中の鉄道、バス、航空機の情報を提供する。

本APIで用いられるデータはセマンティクスの概念をベースとしたucR形式、具体的にはJSON-LD形式で提供される。 まず実在する概念（エンティティ）に対して識別子（ucode）を付与する。鉄道を例に取ると、

列車

駅

路線

駅時刻表

運行情報

などである。そしてこれらのエンティティ間に存在する関係性（Relation, Link）を記述する。

このように、現実に存在するモノの関係性を主語（subject）、述語（predicate）、目的語（object）の 3要素で表現したものはトリプル（triple）と呼ばれる。

本APIで提供する情報は全てこのトリプルをベースとした情報記述が行われる。

そして先に述べた、公共交通情報として存在するエンティティ毎に必要なプロパティの一般化を行い、 それらをRDFクラスとして定義した。次節にてその詳細を記載する。

Note
参考リンク集

uID Center

W3C Resource Description Framework (RDF)

JSON-LD.org

1.1.1. データ種別の名称及びその定義
表 1. 提供するデータ種別の名称及びその定義
種別	rdf:type	名称	詳細
共通

odpt:Calendar

曜日・日付区分

曜日・日付区分が記述される

共通

odpt:Operator

事業者

公共交通機関の事業者が記述される

鉄道

odpt:Station

駅情報

駅の名称や位置など、駅に関連する情報が記述される

鉄道

odpt:StationTimetable

駅時刻表

駅を発着する列車の時刻表情報が記述される

鉄道

odpt:Train

列車情報

列車の位置、行先など、列車のリアルタイムな情報が記述される

鉄道

odpt:TrainTimetable

列車時刻表

列車がどの駅にいつ到着するか、出発するかが記述される

鉄道

odpt:TrainInformation

運行情報

鉄道路線のリアルタイムな運行状況が記述される

鉄道

odpt:TrainType

列車種別

普通、快速など、列車の種別を定義する

鉄道

odpt:RailDirection

進行方向

上り、下りなど、列車の進行方向を定義する

鉄道

odpt:Railway

路線情報

鉄道における路線、運行系統が記述される

鉄道

odpt:RailwayFare

運賃情報

鉄道の運賃が記述される

鉄道

odpt:PassengerSurvey

駅別乗降人員

駅の乗降数集計結果が記述される

バス

odpt:Bus

バス情報

バス車両の位置、行先など、バス車両のリアルタイムな情報が記述される

バス

odpt:BusTimetable

バス時刻表

バスがあるバス停、バス標柱にいつ到着するか、いつ出発するかが記述される e.g. 系統時刻表、スターフ、運行表

バス

odpt:BusroutePattern

バス運行路線情報

バス運行における運行路線情報が記述される

バス

odpt:BusroutePatternFare

バス運賃情報

バスの運賃が記述される

バス

odpt:BusstopPole

バス停標柱情報

バス停における標柱情報が記述される

バス

odpt:BusstopPoleTimetable

バス停標柱時刻表

バスがあるバス停標柱にいつ到着するか、出発するかが記述される e.g. バス停時刻表、標柱時刻表、標柱

航空機

odpt:Airport

空港情報

空港の名称や位置など、空港に関連する情報が記述される

航空機

odpt:AirportTerminal

空港ターミナル情報

空港のターミナルの名称など、空港のターミナルに関連する情報が記述される

航空機

odpt:FlightInformationArrival

フライト到着情報

空港に当日到着する航空機のリアルタイムな情報が記述される

航空機

odpt:FlightInformationDeparture

フライト出発情報

空港を当日出発する航空機のリアルタイムな情報が記述される

航空機

odpt:FlightSchedule

フライト時刻表

航空機の予定される発着時刻情報が記述される e.g. 月間時刻表、週間スケジュール

航空機

odpt:FlightStatus

フライト状況

搭乗中、出発済みなど、空港を発着する航空機の状況を定義する

1.2. 提供するデータ
本APIで提供するデータ種別の名称及びその定義について記載する。

1.2.1. 名前空間
本APIで扱うRDF語彙セットの名前空間として、以下のものを利用する。

表 2. 名前空間
名前空間	Identifier	備考
rdf

http://www.w3.org/1999/02/22-rdf-syntax-ns#

RDF

dc

http://purl.org/dc/elements/1.1/

Dublin Core

geo

http://www.opengis.net/ont/geosparql#

OGC GeoSPARQL 地理情報記述語彙

owl

http://www.w3.org/2002/07/owl#

W3C Web Ontology Language

xsd

http://www.w3.org/2001/XMLSchema-datatypes

XML Schema Datatypes

ug

http://uidcenter.org/vocab/ucr/ug#

uID Center 地物に関する語彙セット

ugsrv

http://uidcenter.org/vocab/ucr/ugsrv#

uID Center 地理情報サービスに関する語彙セット

1.3. インターフェース
本APIではHTTPS RESTful APIによるインターフェースを提供する。

データ取得・検索API
クエリパラメータにて指定されたプロパティにマッチした情報を返すAPI

地物情報取得・検索API
地理情報を使った地理領域による絞込機能を提供するAPI

1.3.1. 留意点
以下に本APIドキュメントにおける留意点を述べる。

本APIで扱うデータは、全てJSON-LDで値を返す。

それぞれのデータは、Object形式で表現される

APIによって出力される結果は全てObjectのArrayとして返される

マッチする結果がない場合、長さ0のArray（空のArray）として返される

マッチする結果が1つの場合、長さ1のArray（Hashを1つ持ったArray）として返される

リクエストを行う際のエンドポイントは、この仕様書では https://api.odpt.org/api/v4/ で開始しているが、データセットによってはこれと異なる場合があるため、データセットごとにエンドポイントを確認すること。

リクエストを行う際のクエリパラメータは、URIエンコードを行った上で送信する必要がある

例えば「東京」は「%E6%9D%B1%E4%BA%AC」とエンコードする必要がある

可読性を保つため、本ドキュメントではURIエンコードを行っていない状態で表記している

リクエスト時には必ず下記に示す方法でAPIアクセスキー（PRIMARY_OR_SECONDRY_KEY）を付与する必要がある

クエリーパラメータ acl:consumerKey=PRIMARY_OR_SECONDRY_KEY

APIによって出力される結果がシステムの上限件数を超える場合、上限件数以下にフィルターされた結果が返る

クエリーパラメータで絞込を行った上で再度必要な情報を取得する必要がある

出力される結果において、odpt:xxx として ID が返される場合、その名称（当該IDにおける dc:title または odpt:xxxTitle）を odpt:xxxTitle として付与して返される場合がある。

1.4. データ検索API (/v4/RDF_TYPE?)
/api/v4/RDF_TYPE では、指定したクエリにマッチした情報を返す。

エンドポイント

https://api.odpt.org/api/v4/RDF_TYPE

HTTP Method

GET

HTTP Status Code

200: 正常終了

400: パラメータ不正

401: acl:consumerKeyが誤っている

403: 権限なし

404: 該当データ無し

405: 許可されていないHTTP Method

500: サーバー内部エラー

503: サービス利用不可

クエリパラメータ

クエリ	説明	必須
rdf:type

取得するデータの種別を指定します。rdf:type一覧を参照

◯

acl:consumerKey

developerサイトにて発行されたアクセストークンを指定

◯

PREDICATE

rdf:typeで指定したクラスの持つブロパティを指定して、フィルタリングを行う

PREDICATEはrdf:type毎に変化するプロパティ名である。rdf:type毎のプロパティ一覧は語彙仕様にて説明する。

リクエスト例
curl -X GET https://api.odpt.org/api/v4/odpt:Train?acl:consumerKey=ACL_CONSUMERKEY
レスポンス例
[
			      {
			      "@context": "http://vocab.odpt.org/context_odpt_Train.jsonld",
			      "@type": "odpt:Train",
			      "@id": "urn:ucode:_00001C000000000000010000030FD5D6",
			      "dc:date": "2017-11-28T11:02:15+09:00",
			      "dct:valid": "2017-11-28T11:02:45+09:00",
			      "odpt:frequency": 30,
			      "odpt:railway": "odpt.Railway:TokyoMetro.Yurakucho",
			      "owl:sameAs": "odpt.Train:TokyoMetro.Yurakucho.B1045S",
			      "odpt:trainNumber": "B1045S",
			      "odpt:trainType": "odpt.TrainType:TokyoMetro.Local",
			      "odpt:delay": 0,
			      "odpt:originStation": [ "odpt.Station:TokyoMetro.Yurakucho.ShinKiba" ],
			      "odpt:destinationStation": [ "odpt.Station:TokyoMetro.Yurakucho.Wakoshi" ],
			      "odpt:fromStation": "odpt.Station:TokyoMetro.Yurakucho.ChikatetsuNarimasu",
			      "odpt:toStation": "odpt.Station:TokyoMetro.Yurakucho.Wakoshi",
			      "odpt:railDirection": "odpt.RailDirection:TokyoMetro.Wakoshi",
			      "odpt:operator": "odpt.Operator:TokyoMetro"
			      }
]
1.4.1. フィルター処理
パラメータに PREDICATE を指定することにより、検索結果を特定の値でフィルタリングできる。

文字列型や数値型の値を持つプロパティの場合は、PREDICATEにはプロパティ名そのものを指定する。

配列型の各要素が文字列型や数値型であるプロパティの場合は、PREDICATEにはプロパティ名そのものを指定する。この場合、「プロパティ=値」は、右辺で指定した値が左辺の配列の少なくとも一つ以上の要素として含まれることを意味する。

オブジェクト型のキーに対する値が文字列型や数値型であるプロパティの場合は、PREDICATEには「プロパティ.キー」を指定する。同様に「プロパティ.キーA.キーB」のようなネストも指定できる。

その他(配列型の要素がオブジェクト型である場合など)のプロパティは指定できない。

例えば駅情報（rdf:typeがodpt:Station）のうち、東京駅の情報のみ取得する場合は、odpt:Stationの持つdc:titleをPREDICATEに指定して、その値に「東京」を指定する。

リクエスト例: dc:title=東京
curl 'https://api.odpt.org/api/v4/odpt:Station?dc:title=東京&acl:consumerKey=ACL_CONSUMERKEY'
あるいはodpt:Stationの持つodpt:stationTitle.en(英語の駅名)をPREDICATEに指定して、その値に「Tokyo」を指定してもよい。

リクエスト例: odpt:stationTitle.en=Tokyo
curl 'https://api.odpt.org/api/v4/odpt:Station?odpt:stationTitle.en=Tokyo&acl:consumerKey=ACL_CONSUMERKEY'
検索条件を複数指定する際には、PREDICATEの値をコンマ "," 区切りで指定することにより、OR検索を実現できる。 たとえば駅情報について、駅名が東京と五反田の情報を一度に取得したい場合は、dc:title に東京と五反田を "," 区切りで指定して検索する。

リクエスト例: dc:title=東京,五反田
curl 'https://api.odpt.org/api/v4/odpt:Station?dc:title=東京,五反田&acl:consumerKey=ACL_CONSUMERKEY'
1.5. データダンプAPI (/v4/RDF_TYPE.json?)
/api/v4/RDF_TYPE.json では、指定したデータ種別（RDF_TYPE）のダンプを返す。 データダンプAPIは以下のデータ種別に対応し、それぞれに保持されている全データを返す。

表 3. データダンプAPIが対応するデータ種別
種別	rdf:type	名称	詳細
共通

odpt:Calendar

曜日・日付区分

曜日・日付区分が記述される

共通

odpt:Operator

事業者

公共交通機関の事業者が記述される

鉄道

odpt:Station

駅情報

駅の名称や位置など、駅に関連する情報が記述される

鉄道

odpt:StationTimetable

駅時刻表

駅を発着する列車の時刻表情報が記述される

鉄道

odpt:TrainTimetable

列車時刻表

列車がどの駅にいつ到着するか、出発するかが記述される

鉄道

odpt:TrainType

列車種別

普通、快速など、列車の種別を定義する

鉄道

odpt:RailDirection

進行方向

上り、下りなど、列車の進行方向を定義する

鉄道

odpt:Railway

路線情報

鉄道における路線、運行系統が記述される

鉄道

odpt:RailwayFare

運賃情報

鉄道の運賃が記述される

鉄道

odpt:PassengerSurvey

駅別乗降人員

駅の乗降数集計結果が記述される

バス

odpt:BusTimetable

バス時刻表

バスがあるバス停、バス標柱にいつ到着するか、いつ出発するかが記述される e.g. 系統時刻表、スターフ、運行表

バス

odpt:BusroutePattern

バス運行路線情報

バス運行における運行路線情報が記述される

バス

odpt:BusroutePatternFare

バス運賃情報

バスの運賃が記述される

バス

odpt:BusstopPole

バス停標柱情報

バス停における標柱情報が記述される

バス

odpt:BusstopPoleTimetable

バス停標柱時刻表

バスがあるバス停標柱にいつ到着するか、出発するかが記述される e.g. バス停時刻表、標柱時刻表、標柱

航空機

odpt:Airport

空港情報

空港の名称や位置など、空港に関連する情報が記述される

航空機

odpt:AirportTerminal

空港ターミナル情報

空港のターミナルの名称など、空港のターミナルに関連する情報が記述される

航空機

odpt:FlightSchedule

フライト時刻表

航空機の予定される発着時刻情報が記述される e.g. 月間時刻表、週間スケジュール

航空機

odpt:FlightStatus

フライト状況

空港を発着する航空機の状況を定義する

エンドポイント

https://api.odpt.org/api/v4/RDF_TYPE.json

HTTP Method

GET

HTTP Status Code

200: 正常終了

400: パラメータ不正

401: acl:consumerKeyが誤っている

403: 権限なし

404: 該当データ無し

405: 許可されていないHTTP Method

500: サーバー内部エラー

503: サービス利用不可

クエリパラメータ

クエリ	説明	必須
RDF_TYPE

取得するデータの種別を指定します。rdf:type一覧を参照

◯

acl:consumerKey

developerサイトにて発行されたアクセストークンを指定

◯

データダンプAPIはリクエスト後ダンプファイルへのURLへHTTP 301 リダイレクトが返されるため、処理を行う際は注意すること。

リクエスト例
curl -X GET -L https://api.odpt.org/api/v4/odpt:Station.json?acl:consumerKey=ACL_CONSUMERKEY
レスポンス例
[
			      {
			      "@context": "http://vocab.odpt.org/context_odpt.jsonld",
			      "@id": "urn:ucode:_00001C000000000000010000031028E6",
			      "@type": "odpt:Station",
			      "dc:title": "東京",
			      "owl:sameAs": "odpt.Station:JR-East.Yamanote.Tokyo",

			      },
			      {
			      "@context": "http://vocab.odpt.org/context_odpt.jsonld",
			      "@id": "urn:ucode:_00001C000000000000010000031028E7",
			      "@type": "odpt:Station",
			      "dc:title": "有楽町",
			      "owl:sameAs": "odpt.Station:JR-East.Yamanote.Yurakucho",

			      }

]
1.6. データ取得API (GET /v4/datapoints/$DATA_URI)
/v4/datapoints/$DATA_URI では、DATA_URIで指定されたURIをIDに持つデータを取得する。 データ取得APIはデータダンプAPIと同じデータ種別に対応する。 $DATA_URIに指定できるIDとして、urn:ucode:_ から始まるucode、または各データに記載された owl:sameAs の値を指定できる。

エンドポイント

https://api.odpt.org/api/v4/datapoints/$DATA_URI

HTTP Method

GET

HTTP Status Code

200: 正常終了

400: パラメータ不正

401: acl:consumerKeyが誤っている

402: 課金が必要

403: 権限なし

404: 該当データ無し

405: 許可されていないHTTP Method

500: サーバー内部エラー

503: サービス利用不可

クエリパラメータ

クエリ	説明	必須
$DATA_URI

取得するデータのURIを指定

◯

acl:consumerKey

developerサイトにて発行されたアクセストークンを指定

◯

ucodeによるリクエスト例
curl -X GET 'https://api.odpt.org/api/v4/datapoints/urn:ucode:_00001C000000000000010000030517CE?acl:consumerKey=ACL_CONSUMERKEY'
owl:sameAsによるリクエスト例
curl -X GET 'https://api.odpt.org/api/v4/datapoints/odpt.Station:TokyoMetro.Ginza.Ueno?acl:consumerKey=ACL_CONSUMERKEY'
1.7. 地物情報検索API (/v4/places/RDF_TYPE?)
/v4/places では、地理情報を用いた領域絞込が可能である。 地物情報検索APIで検索する対象となるデータを以下に挙げる。

表 4. 地物情報検索APIにて対象となるデータ種別
種別	rdf:type	名称	詳細
鉄道

odpt:Station

駅情報

駅の名称や位置など、駅に関連する情報が記述される

バス

odpt:BusstopPole

バス停標柱情報

バス停における標柱情報が記述される

以下にリクエスト時のクエリパラメータを示す。

表 5. 地物情報検索APIクエリパラメータ
クエリ	説明	必須
RDF_TYPE

取得するデータの種別を指定します。rdf:type一覧を参照

◯

lat

取得する範囲の中心緯度を指定、10進数表記、測地系はWGS84

◯

lon

取得する範囲の中心経度を指定、10進数表記、測地系はWGS84

◯

radius

取得する範囲の半径をメートルで指定、0-4000mの範囲

◯

acl:consumerKey

developerサイトにて発行されたアクセストークンを指定

◯

PREDICATE

rdf:typeで指定したクラスの持つプロパティを指定して、フィルタリングを行う

PREDICATEはrdf:type毎に変化するプロパティ名である。

リクエスト例
curl -X GET 'https://api.odpt.org/api/v4/places/odpt:Station?lon=139.766926&lat=35.681265&radius=1000&acl:consumerKey=ACL_CONSUMERKEY'
1.7.1. フィルター処理
パラメータに PREDICATE を指定することにより、検索結果を特定の値でフィルタリングできる。

リクエスト例: dc:title=東京
curl -X GET 'https://api.odpt.org/api/v4/places/odpt:Station?lon=139.766926&lat=35.681265&radius=1000&acl:consumerKey=CONSUMER_KEY&dc:title=東京'
検索条件を複数指定する際には、PREDICATEの値をコンマ "," 区切りで指定することにより、OR検索を実現できる。

リクエスト例: dc:title=東京,大手町
curl -X GET 'https://api.odpt.org/api/v4/places/odpt:Station?lon=139.766926&lat=35.681265&radius=1000&acl:consumerKey=CONSUMER_KEY&dc:title=東京,大手町'
2. 共通クラス
2.1. 概要
共通クラスでは、各種の公共交通機関に共通する以下のデータを定義する。

odpt:Calendar

odpt:Operator

各データの内容については、それぞれの説明を参照すること。

2.1.1. バージョン情報
Version : 4.0.0

2.1.2. URIスキーム
Host : api.odpt.org
BasePath : /api/v4
Schemes : HTTPS

2.1.3. MIMEタイプ
application/json

2.2. パス
2.2.1. GET /api/v4/odpt:Calendar
説明
曜日・日付区分(odpt:Calendar)の内容を取得する。

パラメータ
Type	Name	Description	Schema
Query

acl:consumerKey
required

開発者サイトにて提供されるアクセストークン

string (acl:ConsumerKey)

Query

@id
optional

データに付与された固有識別子

string (URN)

Query

owl:sameAs
optional

データに付与された固有識別子の別名

string (URL)

レスポンス
HTTP Code	Description	Schema
200

正常終了

< odpt:Calendar > array

400

パラメータ不正

No Content

401

acl:consumerKeyが誤っている

No Content

403

権限なし

No Content

404

該当データ無し

No Content

500

サーバー内部エラー

No Content

503

サービス利用不可

No Content

Example HTTP request
Request path
/api/v4/odpt:Calendar?acl:consumerKey=string
Example HTTP response
Response 200
[ {
				    "@context" : "http://vocab.odpt.org/context_odpt.jsonld",
				    "@id" : "urn:ucode:_00001C000000000000010000030FD7E5",
				    "@type" : "odpt:Calendar",
				    "dc:date" : "2017-01-13T15:10:00+09:00",
				    "owl:sameAs" : "odpt.Calendar:Weekday",
				    "dc:title" : "平日",
				    "odpt:calendarTitle" : {
				    "ja" : "平日",
				    "en" : "Weekday"
				    }
} ]
2.2.2. GET /api/v4/odpt:Operator
説明
公共交通機関の事業者(odpt:Operator)の内容を取得する。

パラメータ
Type	Name	Description	Schema
Query

acl:consumerKey
required

開発者サイトにて提供されるアクセストークン

string (acl:ConsumerKey)

Query

@id
optional

データに付与された固有識別子

string (URN)

Query

owl:sameAs
optional

データに付与された固有識別子の別名

string (URL)

レスポンス
HTTP Code	Description	Schema
200

正常終了

< odpt:Operator > array

400

パラメータ不正

No Content

401

acl:consumerKeyが誤っている

No Content

403

権限なし

No Content

404

該当データ無し

No Content

500

サーバー内部エラー

No Content

503

サービス利用不可

No Content

Example HTTP request
Request path
/api/v4/odpt:Operator?acl:consumerKey=string
Example HTTP response
Response 200
[ {
				    "@context" : "http://vocab.odpt.org/context_odpt.jsonld",
				    "@id" : "urn:ucode:_00001C000000000000010000030FD7E5",
				    "@type" : "odpt:Operator",
				    "dc:date" : "2017-01-13T15:10:00+09:00",
				    "owl:sameAs" : "odpt.Operator:JR-East",
				    "dc:title" : "JR東日本",
				    "odpt:operatorTitle" : {
				    "ja" : "JR東日本",
				    "en" : "JR East"
				    }
} ]
2.3. 定義
2.3.1. odpt:Calendar
曜日・日付区分を扱うクラス。ターゲットとなる日付の一覧を保持する。

基底クラス

odpt:Calendar 基底クラスは、汎用的な日付区分を表現するためのクラスである。それぞれはodpt:Calendar型のインスタンスとして存在する。

odpt.Calendar:Weekday: 平日 (月曜日から金曜日まで、ただし休日を除く)

odpt.Calendar:Holiday: 休日 (日曜日、祝日、休日、振替休日)

odpt.Calendar:SaturdayHoliday: 土休日 (土曜日または休日)

odpt.Calendar:Sunday: 日曜日

odpt.Calendar:Monday: 月曜日

odpt.Calendar:Tuesday: 火曜日

odpt.Calendar:Wednesday: 水曜日

odpt.Calendar:Thursday: 木曜日

odpt.Calendar:Friday: 金曜日

odpt.Calendar:Saturday: 土曜日

特定クラス

odpt.Calendar:Specific.Foo.Bar

e.g. odpt.Calendar:Specific.Toei.MarketHoliday: 市場休日

ある日付において複数のカレンダーが該当する場合、優先度は次のとおりとする。

特定クラス(Specific.XXX)は基底クラスよりも優先される

基底クラスの休日(Holiday)が土曜日(Saturday)と重なった場合、休日が優先される

複数の特定クラスが該当する場合は、その日付の時刻表は、その複数の特定クラスの時刻表をマージしたものとなる

Name	Description	Schema
@context
required

JSON-LD仕様に基づく @context のURL
Example : "http://vocab.odpt.org/context_odpt.jsonld"

string (URL)

@id
required

固有識別子(ucode)
Example : "urn:ucode:_00001C000000000000010000030FD7E5"

string (URN)

@type
required

クラス指定。odpt:Calendar
Example : "odpt:Calendar"

string

dc:date
optional

データ生成日時（ISO8601 日付時刻形式）
Example : "2017-01-13T15:10:00+09:00"

string (xsd:dateTime)

owl:sameAs
required

固有識別子。 命名ルールは、odpt.Calendar:名称(.期間) 。
Example : "odpt.Calendar:Weekday"

string (URL)

dc:title
optional

カレンダー名称（日本語）。e.g. 平日、休日、市場休日
Example : "平日"

string

odpt:calendarTitle
optional

カレンダー名称（多言語対応）
Example : {"ja" : "平日", "en" : "Weekday"}

object

odpt:day
optional

該当する日付のリスト。値は全てISO8601の日付形式。
Example : [ "2017-01-13", "2017-01-18" ]

< string (xsd:date) > array

odpt:duration
optional

カレンダー有効期間。値は全てISO8601の期間形式。
Example : "2017-11-13/2017-11-18"

string

2.3.2. odpt:Operator
公共交通機関の事業者を扱うクラス。

Name	Description	Schema
@context
required

JSON-LD仕様に基づく @context のURL
Example : "http://vocab.odpt.org/context_odpt.jsonld"

string (URL)

@id
required

固有識別子(ucode)
Example : "urn:ucode:_00001C000000000000010000030FD7E5"

string (URN)

@type
required

クラス指定。odpt:Operator
Example : "odpt:Operator"

string

dc:date
optional

データ生成日時（ISO8601 日付時刻形式）
Example : "2017-01-13T15:10:00+09:00"

string (xsd:dateTime)

owl:sameAs
required

固有識別子。 命名ルールは、odpt.Operator:名称
Example : "odpt.Operator:XX"

string (URL)

dc:title
optional

事業者名称（日本語）
Example : "○○電鉄"

string

odpt:operatorTitle
optional

事業者名称（多言語対応）
Example : {"ja" : "○○電鉄", "en" : "XX Railway"}

object

3. ODPT Train API
3.1. 概要
Train API では、鉄道に関係した以下のデータを取得できる。

odpt:PassengerSurvey

odpt:Railway

odpt:RailDirection

odpt:RailwayFare

odpt:Station

odpt:StationTimetable

odpt:Train

odpt:TrainInformation

odpt:TrainTimetable

odpt:TrainType

各データの内容については、それぞれの説明を参照すること。

3.1.1. バージョン情報
Version : 4.0.0

3.1.2. URIスキーム
Host : api.odpt.org
BasePath : /api/v4
Schemes : HTTPS

3.1.3. MIMEタイプ
application/json

3.2. パス
3.2.1. GET /api/v4/odpt:PassengerSurvey
説明
駅の乗降人員数を取得する。

パラメータ
Type	Name	Description	Schema
Query

acl:consumerKey
required

開発者サイトにて提供されるアクセストークン

string (acl:ConsumerKey)

Query

@id
optional

データに付与された固有識別子

string (URN)

Query

owl:sameAs
optional

データに付与された固有識別子の別名

string (URL)

Query

odpt:operator
optional

事業者を表すID (odpt:Operatorのowl:sameAs)

string (odpt:Operator owl:sameAs)

Query

odpt:station
optional

駅を表すID (odpt:Stationのowl:sameAs)

string (odpt:Station owl:sameAs)

Query

odpt:railway
optional

路線を表すID (odpt:Railwayのowl:sameAs)

string (odpt:Railway owl:sameAs)

レスポンス
HTTP Code	Description	Schema
200

正常終了

< odpt:PassengerSurvey > array

400

パラメータ不正

No Content

401

acl:consumerKeyが誤っている

No Content

403

権限なし

No Content

404

該当データ無し

No Content

500

サーバー内部エラー

No Content

503

サービス利用不可

No Content

Example HTTP request
Request path
/api/v4/odpt:PassengerSurvey?acl:consumerKey=string
Example HTTP response
Response 200
[ {
				    "@context" : "http://vocab.odpt.org/context_odpt.jsonld",
				    "@id" : "urn:ucode:_00001C000000000000010000030FD7E5",
				    "@type" : "odpt:PassengerSurvey",
				    "dc:date" : "2017-01-13T06:10:00+0000",
				    "owl:sameAs" : "odpt.PassengerSurvey:JR-East.Tokyo",
				    "odpt:operator" : "odpt.Operator:JR-East",
				    "odpt:railway" : [ "odpt.Railway:JR-East.Yamanote", "odpt.Railway:JR-East.ChuoRapid" ],
				    "odpt:station" : [ "odpt.Station:JR-East.Yamanote.Tokyo", "odpt.Station:JR-East.ChuoRapid.Tokyo" ],
				    "odpt:includeAlighting" : false,
				    "odpt:passengerSurveyObject" : [ {
				    "odpt:surveyYear" : 2016,
				    "odpt:passengerJourneys" : 12340
				    }, {
				    "odpt:surveyYear" : 2017,
				    "odpt:passengerJourneys" : 12345
				    } ]
} ]
3.2.2. GET /api/v4/odpt:RailDirection
説明
進行方向の定義を取得する。

パラメータ
Type	Name	Description	Schema
Query

acl:consumerKey
required

開発者サイトにて提供されるアクセストークン

string (acl:ConsumerKey)

Query

@id
optional

データに付与された固有識別子

string (URN)

Query

owl:sameAs
optional

データに付与された固有識別子の別名

string (URL)

レスポンス
HTTP Code	Description	Schema
200

正常終了

< odpt:RailDirection > array

400

パラメータ不正

No Content

401

acl:consumerKeyが誤っている

No Content

403

権限なし

No Content

404

該当データ無し

No Content

500

サーバー内部エラー

No Content

503

サービス利用不可

No Content

Example HTTP request
Request path
/api/v4/odpt:RailDirection?acl:consumerKey=string
Example HTTP response
Response 200
[ {
				    "@context" : "http://vocab.odpt.org/context_odpt.jsonld",
				    "@id" : "urn:ucode:_00001C000000000000010000030FD7E5",
				    "@type" : "odpt:RailDirection",
				    "dc:date" : "2017-01-13T06:10:00+0000",
				    "owl:sameAs" : "odpt.RailDirection:Inbound",
				    "dc:title" : "上り",
				    "odpt:railDirectionTitle" : {
				    "ja" : "上り",
				    "en" : "Inbound"
				    }
} ]
3.2.3. GET /api/v4/odpt:Railway
説明
路線情報を取得する。

パラメータ
Type	Name	Description	Schema
Query

acl:consumerKey
required

開発者サイトにて提供されるアクセストークン

string (acl:ConsumerKey)

Query

@id
optional

データに付与された固有識別子

string (URN)

Query

owl:sameAs
optional

データに付与された固有識別子の別名

string (URL)

Query

dc:title
optional

路線名（e.g. 小田原線、京王線、相模原線）

string

Query

odpt:operator
optional

事業者を表すID (odpt:Operatorのowl:sameAs)

string (odpt:Operator owl:sameAs)

Query

odpt:lineCode
optional

路線コード、路線シンボル表記（e.g. 小田原線 => OH、丸ノ内線 => M）

string

レスポンス
HTTP Code	Description	Schema
200

正常終了

< odpt:Railway > array

400

パラメータ不正

No Content

401

acl:consumerKeyが誤っている

No Content

403

権限なし

No Content

404

該当データ無し

No Content

500

サーバー内部エラー

No Content

503

サービス利用不可

No Content

Example HTTP request
Request path
/api/v4/odpt:Railway?acl:consumerKey=string
Example HTTP response
Response 200
[ {
				    "@context" : "http://vocab.odpt.org/context_odpt.jsonld",
				    "@id" : "urn:ucode:_00001C000000000000010000030FD7E5",
				    "@type" : "odpt:Railway",
				    "dc:date" : "2017-01-13T15:10:00+09:00",
				    "owl:sameAs" : "odpt.Railway:JR-East.ChuoRapid",
				    "dc:title" : "中央線快速",
				    "odpt:railwayTitle" : {
				    "ja" : "中央線快速",
				    "en" : "Chuo Rapid Line"
				    },
				    "odpt:operator" : "odpt.Operator:JR-East",
				    "odpt:ascendingRailDirection" : "odpt.RailDirection:Outbound",
				    "odpt:descendingRailDirection" : "odpt.RailDirection:Inbound",
				    "odpt:stationOrder" : [ {
				    "odpt:index" : 1,
				    "odpt:station" : "odpt.Station:JR-East.ChuoRapid.Tokyo",
				    "odpt:stationTitle" : {
				    "ja" : "東京",
				    "en" : "Tokyo"
				    }
				    }, {
				    "odpt:index" : 2,
				    "odpt:station" : "odpt.Station:JR-East.ChuoRapid.Kanda",
				    "odpt:stationTitle" : {
				    "ja" : "神田",
				    "en" : "Kanda"
				    }
				    }, {
				    "odpt:index" : 3,
				    "odpt:station" : "odpt.Station:JR-East.ChuoRapid.Ochanomizu",
				    "odpt:stationTitle" : {
				    "ja" : "御茶ノ水",
				    "en" : "Ochanomizu"
				    }
				    } ]
} ]
3.2.4. GET /api/v4/odpt:RailwayFare
説明
2駅間の運賃を取得する。

パラメータ
Type	Name	Description	Schema
Query

acl:consumerKey
required

開発者サイトにて提供されるアクセストークン

string (acl:ConsumerKey)

Query

@id
optional

データに付与された固有識別子

string (URN)

Query

owl:sameAs
optional

データに付与された固有識別子の別名

string (URL)

Query

odpt:operator
optional

事業者を表すID (odpt:Operatorのowl:sameAs)

string (odpt:Operator owl:sameAs)

Query

odpt:fromStation
optional

出発駅のID (odpt:Stationのowl:sameAs)

string (odpt:Station owl:sameAs)

Query

odpt:toStation
optional

到着駅のID (odpt:Stationのowl:sameAs)

string (odpt:Station owl:sameAs)

レスポンス
HTTP Code	Description	Schema
200

正常終了

< odpt:RailwayFare > array

400

パラメータ不正

No Content

401

acl:consumerKeyが誤っている

No Content

403

権限なし

No Content

404

該当データ無し

No Content

500

サーバー内部エラー

No Content

503

サービス利用不可

No Content

Example HTTP request
Request path
/api/v4/odpt:RailwayFare?acl:consumerKey=string
Example HTTP response
Response 200
[ {
				    "@context" : "http://vocab.odpt.org/context_odpt.jsonld",
				    "@id" : "urn:ucode:_00001C000000000000010000030FD7E5",
				    "@type" : "odpt:RailwayFare",
				    "dc:date" : "2017-01-13T15:10:00+09:00",
				    "owl:sameAs" : "odpt.RailwayFare:TokyoMetro.Marunouchi.Tokyo.TokyoMetro.Tozai.Nakano",
				    "odpt:operator" : "odpt.Operator:TokyoMetro",
				    "odpt:fromStation" : "odpt.Station:TokyoMetro.Marunouchi.Tokyo",
				    "odpt:toStation" : "odpt.Station:TokyoMetro.Tozai.Nakano",
				    "odpt:ticketFare" : 240,
				    "odpt:icCardFare" : 237,
				    "odpt:childTicketFare" : 120,
				    "odpt:childIcCardFare" : 118
} ]
3.2.5. GET /api/v4/odpt:Station
説明
駅情報を取得する。

パラメータ
Type	Name	Description	Schema
Query

acl:consumerKey
required

開発者サイトにて提供されるアクセストークン

string (acl:ConsumerKey)

Query

@id
optional

データに付与された固有識別子

string (URN)

Query

owl:sameAs
optional

データに付与された固有識別子の別名

string (URL)

Query

dc:title
optional

駅名（e.g. 東京、新宿、上野）

string

Query

odpt:operator
optional

事業者を表すID (odpt:Operatorのowl:sameAs)

string (odpt:Operator owl:sameAs)

Query

odpt:railway
optional

駅が存在する路線ID (odpt:Railwayのowl:sameAs)

string (odpt:Railway owl:sameAs)

Query

odpt:stationCode
optional

駅ナンバリング（e.g. OH01=小田急新宿駅）

string

レスポンス
HTTP Code	Description	Schema
200

正常終了

< odpt:Station > array

400

パラメータ不正

No Content

401

acl:consumerKeyが誤っている

No Content

403

権限なし

No Content

404

該当データ無し

No Content

500

サーバー内部エラー

No Content

503

サービス利用不可

No Content

Example HTTP request
Request path
/api/v4/odpt:Station?acl:consumerKey=string
Example HTTP response
Response 200
[ {
				    "@context" : "http://vocab.odpt.org/context_odpt.jsonld",
				    "@id" : "urn:ucode:_00001C000000000000010000030FD7E5",
				    "@type" : "odpt:Station",
				    "dc:date" : "2017-01-13T15:10:00+09:00",
				    "owl:sameAs" : "odpt.Station:JR-East.Yamanote.Tokyo",
				    "dc:title" : "東京",
				    "odpt:stationTitle" : {
				    "ja" : "東京",
				    "en" : "Tokyo"
				    },
				    "odpt:operator" : "odpt.Operator:JR-East",
				    "odpt:railway" : "odpt.Railway:JR-East.Yamanote",
				    "geo:long" : 139.1234,
				    "geo:lat" : 35.1234
} ]
3.2.6. GET /api/v4/odpt:StationTimetable
説明
駅時刻表を取得する。

パラメータ
Type	Name	Description	Schema
Query

acl:consumerKey
required

開発者サイトにて提供されるアクセストークン

string (acl:ConsumerKey)

Query

@id
optional

データに付与された固有識別子

string (URN)

Query

owl:sameAs
optional

データに付与された固有識別子の別名

string (URL)

Query

odpt:station
optional

駅を表すID（odpt:Stationのowl:sameAs）

string (odpt:Station owl:sameAs)

Query

odpt:railway
optional

路線を表すID（odpt:Railwayのowl:sameAs）

string (odpt:Railway owl:sameAs)

Query

odpt:operator
optional

事業者を表すID（odpt:Operatorのowl:sameAs）

string (odpt:Operator owl:sameAs)

Query

odpt:railDirection
optional

進行方向を表すID（odpt:RailDirectionのowl:sameAs）

string (odpt:RailDirection owl:sameAs)

Query

odpt:calendar
optional

実施日を表すID（odpt:Calendarのowl:sameAs）

string (odpt:Calendar owl:sameAs)

Query

dc:date
optional

特定日付の時刻表を取得

string (xsd:dateTime)

レスポンス
HTTP Code	Description	Schema
200

正常終了

< odpt:StationTimetable > array

400

パラメータ不正

No Content

401

acl:consumerKeyが誤っている

No Content

403

権限なし

No Content

404

該当データ無し

No Content

500

サーバー内部エラー

No Content

503

サービス利用不可

No Content

Example HTTP request
Request path
/api/v4/odpt:StationTimetable?acl:consumerKey=string
Example HTTP response
Response 200
[ {
				    "@context" : "http://vocab.odpt.org/context_odpt.jsonld",
				    "@id" : "urn:ucode:_00001C000000000000010000030FD7E5",
				    "@type" : "odpt:StationTimetable",
				    "dc:date" : "2017-01-13T15:10:00+09:00",
				    "dct:issued" : "2017-01-01",
				    "owl:sameAs" : "odpt.StationTimetable:JR-East.ChuoRapid.Tokyo.Outbound.Weekday",
				    "odpt:operator" : "odpt.Operator:JR-East",
				    "odpt:railway" : "odpt.Railway:JR-East.ChuoRapid",
				    "odpt:station" : "odpt.Station:JR-East.ChuoRapid.Tokyo",
				    "odpt:railDirection" : "odpt.RailDirection:JR-East.Outbound",
				    "odpt:calendar" : "odpt.Calendar:Weekday",
				    "odpt:stationTimetableObject" : [ {
				    "odpt:departureTime" : "06:00",
				    "odpt:destinationStation" : [ "odpt.Station:JR-East.ChuoRapid.Takao" ],
				    "odpt:trainType" : "odpt.TrainType:JR-East.Rapid"
				    }, {
				    "odpt:departureTime" : "06:10",
				    "odpt:destinationStation" : [ "odpt.Station:JR-East.ChuoRapid.Takao" ],
				    "odpt:trainType" : "odpt.TrainType:JR-East.Rapid"
				    }, {
				    "odpt:departureTime" : "06:20",
				    "odpt:destinationStation" : [ "odpt.Station:JR-East.ChuoRapid.Takao" ],
				    "odpt:trainType" : "odpt.TrainType:JR-East.Rapid"
				    } ]
} ]
3.2.7. GET /api/v4/odpt:Train
説明
列車情報(列車の位置情報)を取得する。

パラメータ
Type	Name	Description	Schema
Query

acl:consumerKey
required

開発者サイトにて提供されるアクセストークン

string (acl:ConsumerKey)

Query

owl:sameAs
optional

データに付与された固有識別子の別名

string (URL)

Query

odpt:operator
optional

列車情報を配信する事業者のID (odpt:Operatorのowl:sameAs)

string (odpt:Operator owl:sameAs)

Query

odpt:railway
optional

当該列車が運行している路線のID (odpt:Railwayのowl:sameAs)

string (odpt:Railway owl:sameAs)

レスポンス
HTTP Code	Description	Schema
200

正常終了

< odpt:Train > array

400

パラメータ不正

No Content

401

acl:consumerKeyが誤っている

No Content

403

権限なし

No Content

404

該当データ無し

No Content

500

サーバー内部エラー

No Content

503

サービス利用不可

No Content

Example HTTP request
Request path
/api/v4/odpt:Train?acl:consumerKey=string
Example HTTP response
Response 200
[ {
				    "@context" : "http://vocab.odpt.org/context_odpt.jsonld",
				    "@id" : "urn:uuid:5d7dd592-ef17-4b69-b955-5b4fe5f7e350",
				    "@type" : "odpt:Train",
				    "dc:date" : "2017-12-07T01:24:33+09:00",
				    "owl:sameAs" : "odpt.Train:JR-East.Utsunomiya.565M",
				    "odpt:operator" : "odpt.Operator:JR-East",
				    "odpt:railway" : "odpt.Railway:JR-East.Utsunomiya",
				    "odpt:railDirection" : "odpt.RailwayDirection:Outbound",
				    "odpt:trainNumber" : "565M",
				    "odpt:fromStation" : "odpt.Station:JR-East.Utsunomiya.Suzumenomiya",
				    "odpt:toStation" : "odpt.Station:JR-East.Utsunomiya.Utsunomiya",
				    "odpt:destinationStation" : [ "odpt.Station:JR-East.Utsunomiya.Utsunomiya" ],
				    "odpt:index" : 1,
				    "odpt:delay" : 0,
				    "odpt:carComposition" : 15
} ]
3.2.8. GET /api/v4/odpt:TrainInformation
説明
列車運行情報を取得する。

パラメータ
Type	Name	Description	Schema
Query

acl:consumerKey
required

開発者サイトにて提供されるアクセストークン

string (acl:ConsumerKey)

Query

owl:sameAs
optional

データに付与された固有識別子の別名

string (URL)

Query

odpt:operator
optional

運行情報を配信する事業者のID (odpt:Operatorのowl:sameAs)

string (odpt:Operator owl:sameAs)

Query

odpt:railway
optional

運行情報が発生した路線のID (odpt:Railwayのowl:sameAs)

string (odpt:Railway owl:sameAs)

レスポンス
HTTP Code	Description	Schema
200

正常終了

< odpt:TrainInformation > array

400

パラメータ不正

No Content

401

acl:consumerKeyが誤っている

No Content

403

権限なし

No Content

404

該当データ無し

No Content

500

サーバー内部エラー

No Content

503

サービス利用不可

No Content

Example HTTP request
Request path
/api/v4/odpt:TrainInformation?acl:consumerKey=string
Example HTTP response
Response 200
[ {
				    "@context" : "http://vocab.odpt.org/context_odpt.json",
				    "@id" : "urn:ucode:_00001C000000000000010000030C3BE4",
				    "@type" : "odpt:TrainInformation",
				    "dc:date" : "2017-12-07T01:25:03+09:00",
				    "owl:sameAs" : "odpt.TrainInformation:TokyoMetro.Ginza",
				    "dct:valid" : "2017-12-07T01:30:03+09:00",
				    "odpt:timeOfOrigin" : "2017-11-21T11:31:00+09:00",
				    "odpt:operator" : "odpt.Operator:TokyoMetro",
				    "odpt:railway" : "odpt.Railway:TokyoMetro.Ginza",
				    "odpt:trainInformationText" : {
				    "ja" : "現在、平常どおり運転しています。",
				    "en" : "Running on schedule."
				    }
} ]
3.2.9. GET /api/v4/odpt:TrainTimetable
説明
列車時刻表を取得する。

パラメータ
Type	Name	Description	Schema
Query

acl:consumerKey
required

開発者サイトにて提供されるアクセストークン

string (acl:ConsumerKey)

Query

@id
optional

固有識別子

string (URN)

Query

owl:sameAs
optional

固有識別子別名

string (URL)

Query

odpt:trainNumber
optional

列車番号

string

Query

odpt:railway
optional

路線のID (odpt:Railwayのowl:sameAs)

string (odpt:Railway owl:sameAs)

Query

odpt:operator
optional

運行事業者のID (odpt:Operatorのowl:sameAs)

string (odpt:Operator owl:sameAs)

Query

odpt:trainType
optional

列車種別ID (odpt:TrainTypeのowl:sameAs)

string (odpt:TrainType owl:sameAs)

Query

odpt:train
optional

該当する列車ID (odpt:Trainのowl:sameAs)

string (odpt:Train owl:sameAs)

Query

odpt:calendar
optional

特定のカレンダー情報ID (odpt:Calendarのowl:sameAs)

string (odpt:Calendar owl:sameAs)

レスポンス
HTTP Code	Description	Schema
200

Successful response

< odpt:TrainTimetable > array

400

パラメータ不正

No Content

401

acl:consumerKeyが誤っている

No Content

403

権限なし

No Content

404

該当データ無し

No Content

500

サーバー内部エラー

No Content

503

サービス利用不可

No Content

Example HTTP request
Request path
/api/v4/odpt:TrainTimetable?acl:consumerKey=string
Example HTTP response
Response 200
[ {
				    "@context" : "http://vocab.odpt.org/context_odpt.jsonld",
				    "@id" : "urn:ucode:_00001C000000000000010000030FD7E5",
				    "@type" : "odpt:TrainTimetable",
				    "dc:date" : "2017-01-13T15:10:00+09:00",
				    "dct:issued" : "2017-01-01",
				    "owl:sameAs" : "odpt.TrainTimetable:JR-East.ChuoRapid.123M.Weekday",
				    "odpt:operator" : "odpt.Operator:JR-East",
				    "odpt:railway" : "odpt.Railway:JR-East.ChuoRapid",
				    "odpt:railDirection" : "odpt.RailDirection:Outbound",
				    "odpt:calendar" : "odpt.Calendar:Weekday",
				    "odpt:trainNumber" : "123M",
				    "odpt:trainType" : "odpt.TrainType:JR-East.Rapid",
				    "odpt:originStation" : [ "odpt.Station:JR-East.ChuoRapid.Tokyo" ],
				    "odpt:destinationStation" : [ "odpt.Station:JR-East.ChuoRapid.Takao" ],
				    "odpt:trainTimetableObject" : [ {
				    "odpt:departureTime" : "06:00",
				    "odpt:departureStation" : "odpt.Station:JR-East.ChuoRapid.Tokyo"
				    }, {
				    "odpt:departureTime" : "06:30",
				    "odpt:departureStation" : "odpt.Station:JR-East.ChuoRapid.Tachikawa"
				    }, {
				    "odpt:arrivalTime" : "07:00",
				    "odpt:arrivalStation" : "odpt.Station:JR-East.ChuoRapid.Takao"
				    } ]
} ]
3.2.10. GET /api/v4/odpt:TrainType
説明
列車種別の定義を取得する。

パラメータ
Type	Name	Description	Schema
Query

acl:consumerKey
required

開発者サイトにて提供されるアクセストークン

string (acl:ConsumerKey)

Query

@id
optional

データに付与された固有識別子

string (URN)

Query

owl:sameAs
optional

データに付与された固有識別子の別名

string (URL)

Query

odpt:operator
optional

事業者を表すID (odpt:Operatorのowl:sameAs)

string (odpt:Operator owl:sameAs)

レスポンス
HTTP Code	Description	Schema
200

正常終了

< odpt:TrainType > array

400

パラメータ不正

No Content

401

acl:consumerKeyが誤っている

No Content

403

権限なし

No Content

404

該当データ無し

No Content

500

サーバー内部エラー

No Content

503

サービス利用不可

No Content

Example HTTP request
Request path
/api/v4/odpt:TrainType?acl:consumerKey=string
Example HTTP response
Response 200
[ {
				    "@context" : "http://vocab.odpt.org/context_odpt.jsonld",
				    "@id" : "urn:ucode:_00001C000000000000010000030FD7E5",
				    "@type" : "odpt:TrainType",
				    "dc:date" : "2017-01-13T15:10:00+09:00",
				    "owl:sameAs" : "odpt.TrainType:JR-East.Local",
				    "odpt:operator" : "odpt.Operator:JR-East",
				    "dc:title" : "普通",
				    "odpt:trainTypeTitle" : {
				    "ja" : "普通",
				    "en" : "Local"
				    }
} ]
3.3. 定義
3.3.1. odpt:PassengerSurvey
駅の乗降人員数または乗車人員数を示す。データは各事業者が公表している値となっている。

Name	Description	Schema
@context
required

JSON-LD仕様に基づく @context のURL
Example : "http://vocab.odpt.org/context_odpt.jsonld"

string (URL)

@id
required

固有識別子(ucode)
Example : "urn:ucode:_00001C000000000000010000030FD7E5"

string (URN)

@type
required

クラス名。odpt:PassengerSurvey
Example : "odpt:PassengerSurvey"

string

dc:date
required

データ生成日時（ISO8601 日付時刻形式）
Example : "2017-01-13T15:10:00+09:00"

string (xsd:dateTime)

owl:sameAs
required

固有識別子。命名ルールは odpt.PassengerSurvey:会社名.駅名 または odpt.PassengerSurvey:会社名.路線名.駅名である。
Example : "odpt.PassengerSurvey:JR-East.Tokyo"

string (URL)

odpt:operator
required

運行会社を表すID (odpt:Operatorのowl:sameAs)
Example : "odpt.Operator:JR-East"

string (odpt:Operator owl:sameAs)

odpt:station
required

駅を表すID (odpt:Stationのowl:sameAs) のリスト
Example : [ "odpt.Station:JR-East.Yamanote.Tokyo", "odpt.Station:JR-East.ChuoRapid.Tokyo" ]

< string (odpt:Station owl:sameAs) > array

odpt:railway
required

路線を表すID (odpt:Railwayのowl:sameAs) のリスト
Example : [ "odpt.Railway:JR-East.Yamanote", "odpt.Railway:JR-East.ChuoRapid" ]

< string (odpt:Railway owl:sameAs) > array

odpt:includeAlighting
required

乗降人員(降車を含む)の場合は true、乗車人員(降車を含まない)の場合は false
Example : true

boolean (xsd:boolean)

odpt:passengerSurveyObject
required

調査年度と平均乗降人員数(または乗車人員数)の組のリスト
Example : [ {"odpt:surveyYear" : 2017, "odpt:passengerJourneys" : 12345 } ]

< odpt:PassengerSurveyObject > array

odpt:PassengerSurveyObject

Name	Description	Schema
odpt:surveyYear
required

調査年度
Example : 2017

integer

odpt:passengerJourneys
required

駅の1日あたりの平均乗降人員数(または乗車人員数)
Example : 12345

integer

3.3.2. odpt:RailDirection
上りや下りなど、列車の進行方向を定義する。

鉄道会社や路線によっては、南行や北行などと案内する場合でも、便宜上、odpt.RailDirection:Inbound や odpt.RailDirection:Outbound で表す場合がある。

Name	Description	Schema
@context
required

JSON-LD 仕様に基づく@context のURL
Example : "http://vocab.odpt.org/context_odpt.jsonld"

string (URL)

@id
required

固有識別子(ucode)
Example : "urn:ucode:_00001C000000000000010000030FD7E5"

string (URN)

@type
required

クラス名。odpt:RailDirection
Example : "odpt:RailDirection"

string

dc:date
optional

進行方向情報の生成時刻(ISO8601 日付時刻形式)
Example : "2017-01-13T15:10:00+09:00"

string (xsd:dateTime)

owl:sameAs
required

固有識別子。命名ルールは、odpt.RailDirection:進行方向 または odpt.RailDirection:会社名.進行方向 である。
Example : "odpt.RailDirection:Inbound"

string (URL)

dc:title
optional

進行方向（日本語）
Example : "上り"

string

odpt:railDirectionTitle
optional

進行方向（多言語対応）
Example : {"ja" : "上り", "en" : "Inbound"}

object

3.3.3. odpt:Railway
鉄道路線（運行系統）の情報を示す。 運行系統名 dc:title は、一般的に用いられる路線名・愛称を示す。 例えば dc:title が山手線の場合、一般的に認知されている都内を一周している山手線の情報を示す。

Name	Description	Schema
@context
required

JSON-LD仕様に基づく @context のURL
Example : "http://vocab.odpt.org/context_odpt.jsonld"

string (URL)

@id
required

固有識別子(ucode)
Example : "urn:ucode:_00001C000000000000010000030FD7E5"

string (URN)

@type
required

クラス名。odpt:Railway
Example : "odpt:Railway"

string

dc:date
required

データ生成日時（ISO8601 日付時刻形式）
Example : "2017-01-13T15:10:00+09:00"

string (xsd:dateTime)

owl:sameAs
required

固有識別子。命名ルールは、odpt.Railway:会社名.路線名である。
Example : "odpt.Railway:JR-East.Yamanote"

string (URL)

dc:title
required

路線名（日本語）
Example : "山手線"

string

odpt:railwayTitle
optional

路線名（多言語対応）
Example : {"ja" : "山手線", "en" : "Yamanote Line"}

object

odpt:kana
optional

路線名のよみがな（ひらがな表記）
Example : "string"

string

odpt:operator
required

運行会社を表すID (odpt:Operatorのowl:sameAs)
Example : "odpt.Operator:JR-East"

string (odpt:Operator owl:sameAs)

odpt:lineCode
optional

路線コード、路線シンボル表記を格納。e.g. 丸ノ内線=>M
Example : "M"

string

odpt:color
optional

路線のラインカラーをHEX表記#RRGGBB、DIC表記DICnnn、PANTONE表記PANTONExxxxで表記する
Example : "string"

string

ug:region
optional

GeoJSON形式による地物情報
Example : "object"

object

odpt:ascendingRailDirection
optional

昇順の進行方向を表すID。odpt:stationOrderのodpt:indexの昇順方向を、odpt:RailDirectionのowl:sameAsで表したIDで格納する。
Example : "odpt.RailDirection:Outbound"

string (odpt:RailDirection owl:sameAs)

odpt:descendingRailDirection
optional

降順の進行方向を表すID。odpt:stationOrderのodpt:indexの降順方向を、odpt:RailDirectionのowl:sameAsで表したIDで格納する。
Example : "odpt.RailDirection:Inbound"

string (odpt:RailDirection owl:sameAs)

odpt:stationOrder
required

駅の順序を表すリスト
Example : [ {"odpt:index" : 1, "odpt:station" : "odpt.Station:JR-East.ChuoRapid.Tokyo"} ]

< odpt:StationOrder > array

odpt:StationOrder

Name	Description	Schema
odpt:station
required

駅を表すID (odpt:Stationのowl:sameAs)
Example : "odpt.Station:TokyoMetro.Marunouchi.Tokyo"

string (odpt:Station owl:sameAs)

odpt:stationTitle
optional

駅名（多言語対応）
Example : {"ja" : "東京", "en" : "Tokyo"}

object

odpt:index
required

駅の順序を示す整数値。原則として、列車は進行方向に応じて、この値の昇順または降順に停車する。環状線などの場合は、同一の駅が複数回記載される場合がある。
Example : 1

integer

3.3.4. odpt:RailwayFare
2駅間の運賃情報を示す。この情報は各事業者より提供された情報を元に構築されている。

Name	Description	Schema
@context
required

JSON-LD仕様に基づく @context のURL
Example : "http://vocab.odpt.org/context_odpt.jsonld"

string (URL)

@id
required

固有識別子(ucode)
Example : "urn:ucode:_00001C000000000000010000030FD7E5"

string (URN)

@type
required

クラス名。odpt:RailwayFare
Example : "odpt:RailwayFare"

string

dc:date
required

データ生成日時（ISO8601 日付時刻形式）
Example : "2017-01-13T15:10:00+09:00"

string (xsd:dateTime)

dct:issued
optional

運賃改定日（ISO8601 日付形式）
Example : "2017-01-13"

string (xsd:date)

dct:valid
optional

データの保証期限（ISO8601 日付時刻形式）
Example : "2017-01-13T15:10:00+09:00"

string (xsd:dateTime)

owl:sameAs
required

固有識別子。命名ルールはodpt.RailwayFare:出発駅の会社名.出発駅の路線名.出発駅名.到着駅の会社名.到着駅の路線名.到着駅名である。
Example : "odpt.RailwayFare:TokyoMetro.Marunouchi.Tokyo.TokyoMetro.Tozai.Nakano"

string (URL)

odpt:operator
required

運行会社を表すID (odpt:Operatorのowl:sameAs)
Example : "odpt.Operator:TokyoMetro"

string (odpt:Operator owl:sameAs)

odpt:fromStation
required

出発駅のID (odpt:Stationのowl:sameAs)
Example : "odpt.Station:TokyoMetro.Marunouchi.Tokyo"

string (odpt:Station owl:sameAs)

odpt:toStation
required

到着駅のID (odpt:Stationのowl:sameAs)
Example : "odpt.Station:TokyoMetro.Tozai.Nakano"

string (odpt:Station owl:sameAs)

odpt:ticketFare
required

切符利用時の運賃
Example : 200

integer

odpt:icCardFare
optional

ICカード利用時の運賃
Example : 196

integer

odpt:childTicketFare
optional

切符利用時の子供運賃
Example : 100

integer

odpt:childIcCardFare
optional

ICカード利用時の子供運賃
Example : 98

integer

odpt:viaStation
optional

運賃計算上の経由駅を表すID (odpt:Stationのowl:sameAs) のリスト
Example : [ "odpt.Station:TokyoMetro.Tozai.NishiFunabashi" ]

< string (odpt:Station owl:sameAs) > array

odpt:viaRailway
optional

運賃計算上の経由路線を表すID (odpt:Railwayのowl:sameAs) のリスト
Example : [ "odpt.Railway:TokyoMetro.Tozai" ]

< string (odpt:Railway owl:sameAs) > array

odpt:ticketType
optional

チケット種別（特急、ライナーなど列車種別によって料金が異なる場合に記載）
Example : "string"

string (odpt:TicketType owl:sameAs)

odpt:paymentMethod
optional

支払い方法のリスト
Example : [ "string" ]

< string > array

3.3.5. odpt:Station
駅情報を示す。この情報は各事業者より提供された情報を元に構築されている。

Name	Description	Schema
@context
required

JSON-LD 仕様に基づく@context のURL
Example : "http://vocab.odpt.org/context_odpt.jsonld"

string (URL)

@id
required

固有識別子(ucode)
Example : "urn:ucode:_00001C000000000000010000030FD7E5"

string (URN)

@type
required

クラス名。odpt:Station
Example : "odpt:Station"

string

dc:date
required

データ生成日時（ISO8601 日付時刻形式）
Example : "2017-01-13T15:10:00+09:00"

string (xsd:dateTime)

owl:sameAs
required

固有識別子。命名ルールは、odpt.Station:会社名.路線名.駅名である。
Example : "odpt.Station:JR-East.Yamanote.Tokyo"

string (URL)

dc:title
optional

駅名（日本語）
Example : "東京"

string

odpt:stationTitle
optional

駅名（多言語対応）
Example : {"ja" : "東京", "en" : "Tokyo"}

object

odpt:operator
required

運行会社を表すID (odpt:Operatorのowl:sameAs)
Example : "odpt.Operator:JR-East"

string (odpt:Operator owl:sameAs)

odpt:railway
required

路線を表すID (odpt:Railwayのowl:sameAs)
Example : "odpt.Railway:JR-East.Yamanote"

string (odpt:Railway owl:sameAs)

odpt:stationCode
optional

駅コード
Example : "JY01"

string

geo:long
optional

代表点の経度 (10進表記、測地系はWGS84)
Example : 139.1234

number

geo:lat
optional

代表点の緯度 (10進表記、測地系はWGS84)
Example : 35.1234

number

ug:region
optional

GeoJSON形式による地物情報
Example : "object"

object

odpt:exit
optional

駅出入口を表すIDのリスト。IDにはug:Poiの@idの値を利用する。
Example : [ "string" ]

< string > array

odpt:connectingRailway
optional

乗り換え可能路線のID (odpt:Railwayのowl:sameAs) のリスト
Example : [ "odpt.Railway:JR-East.ChuoRapid", "odpt.Railway:TokyoMetro.Marunouchi" ]

< string (odpt:Railway owl:sameAs) > array

odpt:connectingStation
optional

乗り換え可能駅のID (odpt:Stationのowl:sameAs) のリスト
Example : [ "odpt.Station:JR-East.ChuoRapid.Tokyo", "odpt.Station:TokyoMetro.Marunouchi.Otemachi" ]

< string (odpt:Station owl:sameAs) > array

odpt:stationTimetable
optional

駅時刻表を表すID (odpt:StationTimetableのowl:sameAs) のリスト
Example : [ "odpt.StationTimeTable:JR-East.Yamanote.Tokyo.OuterLoop.Weekday" ]

< string (odpt:StationTimetable owl:sameAs) > array

odpt:passengerSurvey
optional

駅乗降人員数を表すID (odpt:PassengerSurveyのowl:sameAs) のリスト
Example : [ "odpt.PassengerSurvey:JR-East.Tokyo" ]

< string (odpt:PassengerSurvey owl:sameAs) > array

3.3.6. odpt:StationTimetable
駅、路線、方面毎に分かれた駅時刻表情報を示す。

日付を超える場合、odpt:arrivalTime, odpt:departureTimeは00:00〜23:59 までの時刻表現となるため、A駅-B駅間での発車時刻表現は、A駅 23:58発 -> B駅 00:03着 といった表現になる。 従って、日付超えを判断するには、前駅からの時刻（時）変化で23 -> 00 となった場合に日付を超えたとクライアント側で判定する必要がある。

Name	Description	Schema
@context
required

JSON-LD仕様に基づく @context のURL
Example : "http://vocab.odpt.org/context_odpt.jsonld"

string (URL)

@id
required

固有識別子(ucode)
Example : "urn:ucode:_00001C000000000000010000030FD7E5"

string (URN)

@type
required

クラス名。odpt:StationTimetable
Example : "odpt:StationTimetable"

string

dc:date
required

データ生成日時（ISO8601 日付時刻形式）
Example : "2017-01-13T15:10:00+09:00"

string (xsd:dateTime)

dct:issued
optional

ダイヤ改正日（ISO8601 日付形式）
Example : "2017-01-13"

string (xsd:date)

dct:valid
optional

データの保証期限（ISO8601 日付時刻形式）
Example : "2017-01-13T15:10:00+09:00"

string (xsd:dateTime)

owl:sameAs
required

固有識別子。命名ルールは、odpt.StationTimetable:会社名.路線名.駅名.方面名.曜日種別 である。
Example : "odpt.StationTimetable:JR-East.ChuoRapid.Tokyo.Outbound.Weekday"

string (URL)

odpt:operator
required

運行会社を表すID (odpt:Operatorのowl:sameAs)
Example : "odpt.Operator:JR-East"

string (odpt:Operator owl:sameAs)

odpt:railway
required

路線を表すID (odpt:Railwayのowl:sameAs)
Example : "odpt.Railway:JR-East.ChuoRapid"

string (odpt:Railway owl:sameAs)

odpt:railwayTitle
optional

路線名（多言語対応）
Example : {"ja" : "中央線快速", "en" : "Chuo Rapid"}

object

odpt:station
optional

駅を表すID (odpt:Stationのowl:sameAs)
Example : "odpt.Station:JR-East.ChuoRapid.Tokyo"

string (odpt:Station owl:sameAs)

odpt:stationTitle
optional

駅名（多言語対応）
Example : {"ja" : "東京", "en" : "Tokyo"}

object

odpt:railDirection
optional

方面を表すID (odpt:RailDirectionのowl:sameAs)
Example : "odpt.RailDirection:Outbound"

string (odpt:RailDirection owl:sameAs)

odpt:calendar
optional

運行を行う曜日・日付情報のID (odpt:Calendarのowl:sameAs)
Example : "odpt.Calendar:Weekday"

string (odpt:Calendar owl:sameAs)

odpt:stationTimetableObject
required

出発時刻、終着（行先）駅等の組のリスト
Example : [ {"odpt:departureTime" : "06:00"}, {"odpt:departureTime" : "07:00"} ]

< odpt:stationTimetableObject > array

odpt:note
optional

その他プロパティとして定義されていない注釈情報の自然言語による記載（多言語対応）
Example : {"ja" : "日本語での注釈情報", "en" : "Note in English"}

object

odpt:stationTimetableObject

Name	Description	Schema
odpt:arrivalTime
optional

到着時刻 (ISO8601時刻形式)
Example : "05:08"

string (odpt:Time)

odpt:departureTime
optional

出発時刻 (ISO8601時刻形式）
Example : "05:09"

string (odpt:Time)

odpt:originStation
optional

始発駅を表すID (odpt:Stationのowl:sameAs) のリスト
Example : [ "odpt.Station:JR-East.ChuoRapid.Tokyo" ]

< string (odpt:Station owl:sameAs) > array

odpt:destinationStation
optional

終着駅(行先駅)を表すID (odpt:Stationのowl:sameAs) のリスト
Example : [ "odpt.Station:JR-East.ChuoRapid.Takao" ]

< string (odpt:Station owl:sameAs) > array

odpt:viaStation
optional

経由駅を表すID (odpt:Stationのowl:sameAs) のリスト
Example : [ "odpt.Station:TokyoMetro.Tozai.NishiFunabashi" ]

< string (odpt:Station owl:sameAs) > array

odpt:viaRailway
optional

経由路線を表すID (odpt:Railwayのowl:sameAs) のリスト
Example : [ "odpt.Railway:TokyoMetro.Tozai" ]

< string (odpt:Railway owl:sameAs) > array

odpt:train
optional

到着または出発する列車ID (odpt:Trainのowl:sameAs)
Example : "odpt.Train:JR-East.Yamanote.123M"

string (odpt:Train owl:sameAs)

odpt:trainNumber
optional

列車番号
Example : "123M"

string

odpt:trainType
optional

列車種別のID (odpt:TrainTypeのowl:sameAs)
Example : "odpt.TrainType:JR-East.Local"

string (odpt:TrainType owl:sameAs)

odpt:trainName
optional

編成の名称・愛称のリスト（多言語対応）
Example : [ {"ja" : "むさし", "en" : "Musashi"} ]

< object > array

odpt:trainOwner
optional

車両の所属会社を表すID (odpt:Operatorのowl:sameAs)
Example : "odpt.Operator:JR-East"

string (odpt:Operator owl:sameAs)

odpt:isLast
optional

最終電車の場合、true。最終電車でない場合は省略
Example : true

boolean (xsd:boolean)

odpt:isOrigin
optional

始発駅の場合、true。始発駅ではない場合は省略
Example : true

boolean (xsd:boolean)

odpt:platformNumber
optional

列車が到着するプラットフォームの番号
Example : "1"

string

odpt:platformName
optional

列車が到着 又は出発するプラットフォームの名称（多言語対応）
Example : {"ja" : "日本語名称", "en" : "English Name"}

object

odpt:carComposition
optional

車両数（駅に停車する車両数が列車毎に異なる場合に格納する）
Example : 8

integer

odpt:note
optional

その他プロパティとして定義されていない注釈情報の自然言語による記載（多言語対応）
Example : {"ja" : "日本語での注釈情報", "en" : "Note in English"}

object

3.3.7. odpt:Train
リアルアイムな列車の位置情報を示す。 具体的には、「駅から駅へ移動」というodpt:fromStation, odpt:toStationを用いた相対位置情報表記を行う。

現在位置	odpt:fromStaion	odpt:toStation
A駅-B駅間に在線

A駅

B駅

A駅付近に在線

A駅

null

在線には、走行中(通過中)、停車中の場合を含む。

「A駅付近に在線」の判別がつかない場合は、 odpt:toStation が null とはならない場合がある。

Name	Description	Schema
@context
required

JSON-LD仕様に基づく @context のURL
Example : "http://vocab.odpt.org/context_odpt.jsonld"

string (URL)

@id
required

固有識別子(ucode又はuuid)
Example : "urn:ucode:_00001C000000000000010000030FD7E5"

string (URN)

@type
required

クラス名。odpt:Train
Example : "odpt:Train"

string

dc:date
required

データ生成日時（ISO8601 日付時刻形式）
Example : "2017-01-13T15:10:00+09:00"

string (xsd:dateTime)

dct:valid
optional

データ保証期限（ISO8601 日付時刻形式）
Example : "2017-01-13T15:15:00+09:00"

string (xsd:dateTime)

owl:sameAs
required

固有識別子。命名ルールは、odpt.Train:会社名.路線名.列車番号である。
Example : "odpt.Train:JR-East.Yamanote.123M"

string (URL)

odpt:operator
required

運行会社を表すID (odpt:Operatorのowl:sameAs)
Example : "odpt.Operator:JR-East"

string (odpt:Operator owl:sameAs)

odpt:railway
required

鉄道路線を表すID (odpt:Railwayのowl:sameAs)
Example : "odpt.Railway:JR-East.Yamanote"

string (odpt:Railway owl:sameAs)

odpt:railDirection
optional

進行方向を表すID (odpt:RailDirectionのowl:sameAs)
Example : "odpt.RailDirection:Outbound"

string (odpt:RailDirection owl:sameAs)

odpt:trainNumber
required

列車番号
Example : "123M"

string

odpt:trainType
optional

列車種別 (odpt:TrainTypeのowl:sameAs)
Example : "odpt.TrainType:JR-East.Local"

string (odpt:TrainType owl:sameAs)

odpt:trainName
optional

編成の名称・愛称のリスト（多言語対応）
Example : [ {"ja" : "むさし", "en" : "Musashi"} ]

< object > array

odpt:fromStation
optional

列車が直前に出た駅、あるいは停車中の駅を表すID (odpt:Stationのowl:sameAs) を格納。 詳細はodpt:Trainの説明の冒頭に記載
Example : "odpt.Station:JR-East.ChuoRapid.Tokyo"

string (odpt:Station owl:sameAs)

odpt:toStation
optional

列車が向かっている駅を表すID (odpt:Stationのowl:sameAs) を格納。 詳細はodpt:Trainの説明の冒頭に記載
Example : "odpt.Station:JR-East.ChuoRapid.Tokyo"

string (odpt:Station owl:sameAs)

odpt:originStation
optional

列車の始発駅を表すID (odpt:Stationのowl:sameAs) のリスト
Example : [ "odpt.Station:JR-East.ChuoRapid.Tokyo" ]

< string (odpt:Station owl:sameAs) > array

odpt:destinationStation
optional

列車の終着駅(行先駅)を表すID (odpt:Stationのowl:sameAs) のリスト
Example : [ "odpt.Station:JR-East.ChuoRapid.Takao" ]

< string (odpt:Station owl:sameAs) > array

odpt:viaStation
optional

列車の経由駅を表すID (odpt:Stationのowl:sameAs) のリスト
Example : [ "odpt.Station:TokyoMetro.Tozai.NishiFunabashi" ]

< string (odpt:Station owl:sameAs) > array

odpt:viaRailway
optional

列車の経由路線を表すID (odpt:Railwayのowl:sameAs)のリスト
Example : [ "odpt.Railway:TokyoMetro.Tozai" ]

< string (odpt:Railway owl:sameAs) > array

odpt:trainOwner
optional

車両の所属会社を表すID (odpt:Operatorのowl:sameAs)
Example : "odpt.Operator:JR-East"

string (odpt:Operator owl:sameAs)

odpt:index
optional

路線内の列車順序
Example : 1

integer

odpt:delay
optional

遅延時間（秒）
Example : 60

integer

odpt:carComposition
optional

車両数
Example : 8

integer

odpt:note
optional

その他プロパティとして定義されていない注釈情報の自然言語による記載（多言語対応）
Example : {"ja" : "日本語での注釈情報", "en" : "Note in English"}

object

3.3.8. odpt:TrainInformation
リアルアイムな列車運行情報を示す。 運行障害発生時のみ運行情報が生成される路線と、 平常運転時でも「平常」などの文字列を含んだ文字列を返す路線が存在する。

Name	Description	Schema
@context
required

JSON-LD仕様に基づく @context のURL
Example : "http://vocab.odpt.org/context_odpt.jsonld"

string (URL)

@id
required

固有識別子(ucode又はuuid)
Example : "urn:ucode:_00001C000000000000010000030FD7E5"

string (URN)

@type
required

クラス名。odpt:TrainInformation
Example : "odpt:TrainInformation"

string

dc:date
required

データ生成日時（ISO8601 日付時刻形式）
Example : "2017-01-13T15:10:00+09:00"

string (xsd:dateTime)

dct:valid
optional

データ保証期限（ISO8601 日付時刻形式）
Example : "2017-01-13T15:15:00+09:00"

string (xsd:dateTime)

owl:sameAs
required

固有識別子。命名ルールは、odpt.TrainInformation:会社名.路線名 または odpt.TrainInformation:会社名 である。
Example : "odpt.TrainInformation:JR-East.Yamanote"

string (URL)

odpt:timeOfOrigin
required

発生時刻（ISO8601 日付時刻形式）
Example : "2017-01-13T15:15:00+09:00"

string (xsd:dateTime)

odpt:operator
required

運行会社を表すID (odpt:Operatorのowl:sameAs)
Example : "odpt.Operator:JR-East"

string (odpt:Operator owl:sameAs)

odpt:railway
optional

発生路線を表すID (odpt:Railwayのowl:sameAs)
Example : "odpt.Railway:JR-East.Yamanote"

string (odpt:Railway owl:sameAs)

odpt:trainInformationStatus
optional

平常時は省略。運行情報が存在する場合は「運行情報あり」を格納。遅延などの情報を取得可能な場合は、「遅延」等のテキストを格納（多言語対応）
Example : {"ja" : "日本語テキスト", "en" : "Text in English"}

object

odpt:trainInformationText
required

運行情報テキスト（多言語対応）
Example : {"ja" : "日本語テキスト", "en" : "Text in English"}

object

odpt:railDirection
optional

運行情報の適用される方向を表すID。IDにはodpt:RailDirectionのowl:sameAsの値を利用する。取得不可能な場合は省略
Example : "odpt.RailDirection:Outbound"

string (odpt:RailDirection owl:sameAs)

odpt:trainInformationArea
optional

発生エリア。取得不可能な場合は省略（多言語対応）
Example : {"ja" : "日本語テキスト", "en" : "Text in English"}

object

odpt:trainInformationKind
optional

鉄道種類。取得不可能な場合は省略（多言語対応）
Example : {"ja" : "日本語テキスト", "en" : "Text in English"}

object

odpt:stationFrom
optional

発生場所起点。取得不可能な場合は省略
Example : "odpt.Station:JR-East.Yamanote.Tokyo"

string (odpt:Station owl:sameAs)

odpt:stationTo
optional

発生場所終点。取得不可能な場合は省略
Example : "odpt.Station:JR-East.Yamanote.Tokyo"

string (odpt:Station owl:sameAs)

odpt:trainInformationRange
optional

発生区間。取得不可能な場合は省略（多言語対応）
Example : {"ja" : "日本語テキスト", "en" : "Text in English"}

object

odpt:trainInformationCause
optional

発生理由。取得不可能な場合は省略（多言語対応）
Example : {"ja" : "日本語テキスト", "en" : "Text in English"}

object

odpt:transferRailways
optional

振替路線一覧のリスト
Example : [ "odpt.Railway:JR-East.Yamanote" ]

< string (odpt:Railway owl:sameAs) > array

odpt:resumeEstimate
optional

復旧見込み時刻。ただし配信されない場合が多い
Example : "2017-01-13T15:15:00+09:00"

string (xsd:dateTime)

3.3.9. odpt:TrainTimetable
列車時刻表を示す。

Name	Description	Schema
@context
required

JSON-LD仕様に基づく @context のURL
Example : "http://vocab.odpt.org/context_odpt.jsonld"

string (URL)

@id
required

固有識別子(ucode)
Example : "urn:ucode:_00001C000000000000010000030FD7E5"

string (URN)

@type
required

クラス名。odpt:TrainTimetable
Example : "odpt:TrainTimetable"

string

dc:date
required

データ生成日時（ISO8601 日付時刻形式）
Example : "2017-01-13T15:10:00+09:00"

string (xsd:dateTime)

dct:issued
optional

ダイヤ改正日（ISO8601 日付形式）
Example : "2017-01-13"

string (xsd:date)

dct:valid
optional

データの保証期限（ISO8601 日付時刻形式）
Example : "2017-01-13T15:10:00+09:00"

string (xsd:dateTime)

owl:sameAs
required

固有識別子。命名ルールは、odpt.TrainTimetable:会社名.路線名.列車番号.曜日種別 である。前記の命名ルールで重複が生じる場合は、末尾に .1, .2, .3, … をつけて区別する。
Example : "odpt.TrainTimetable:JR-East.ChuoRapid.123M.Weekday"

string (URL)

odpt:operator
required

運行会社を表すID (odpt:Operatorのowl:sameAs)
Example : "odpt.Operator:JR-East"

string (odpt:Operator owl:sameAs)

odpt:railway
required

路線のIDを格納する。IDにはodpt:Railwayのowl:sameAsの値を利用する。
Example : "odpt.Railway:JR-East.Yamanote"

string (odpt:Railway owl:sameAs)

odpt:railDirection
optional

進行方向を表すID (odpt:RailDirectionのowl:sameAs)
Example : "odpt.RailDirection:Outbound"

string (odpt:RailDirection owl:sameAs)

odpt:calendar
optional

運行を行う曜日・日付情報のID (odpt:Calendarのowl:sameAs)
Example : "odpt.Calendar:Weekday"

string (odpt:Calendar owl:sameAs)

odpt:train
optional

列車のID (odpt:Trainのowl:sameAs)
Example : "odpt.Train:JR-East.Yamanote.123M"

string (odpt:Train owl:sameAs)

odpt:trainNumber
required

列車番号
Example : "123M"

string

odpt:trainType
optional

列車種別のID (odpt:TrainTypeのowl:sameAs)
Example : "odpt.TrainType:JR-East.Local"

string (odpt:TrainType owl:sameAs)

odpt:trainName
optional

編成の名称・愛称のリスト（多言語対応）
Example : [ {"ja" : "むさし", "en" : "Musashi"} ]

< object > array

odpt:trainOwner
optional

車両の所属会社を表すID (odpt:Operatorのowl:sameAs)
Example : "odpt.Operator:JR-East"

string (odpt:Operator owl:sameAs)

odpt:originStation
optional

列車の始発駅を表すID (odpt:Stationのowl:sameAs) のリスト
Example : [ "odpt.Station:JR-East.ChuoRapid.Tokyo" ]

< string (odpt:Station owl:sameAs) > array

odpt:destinationStation
optional

列車の終着駅(行先駅)を表すID (odpt:Stationのowl:sameAs) のリスト
Example : [ "odpt.Station:JR-East.ChuoRapid.Takao" ]

< string (odpt:Station owl:sameAs) > array

odpt:viaStation
optional

列車の経由駅を表すID (odpt:Stationのowl:sameAs) のリスト
Example : [ "odpt.Station:TokyoMetro.Tozai.NishiFunabashi" ]

< string (odpt:Station owl:sameAs) > array

odpt:viaRailway
optional

列車の経由路線を表すID (odpt:Railwayのowl:sameAs) のリスト
Example : [ "odpt.Railway:TokyoMetro.Tozai" ]

< string (odpt:Railway owl:sameAs) > array

odpt:previousTrainTimetable
optional

同一の列車の列車時刻表が複数に分かれている場合、直前の列車時刻表を表すID (odpt:TrainTimetableのowl:sameAs) のリスト
Example : [ "odpt.TrainTimetable:JR-East.ChuoRapid.123M.Weekday" ]

< string (odpt:TrainTimetable owl:sameAs) > array

odpt:nextTrainTimetable
optional

同一の列車の列車時刻表が複数に分かれている場合、直後の列車時刻表を表すID (odpt:TrainTimetableのowl:sameAs) のリスト
Example : [ "odpt.TrainTimetable:JR-East.ChuoRapid.123M.Weekday" ]

< string (odpt:TrainTimetable owl:sameAs) > array

odpt:trainTimetableObject
required

出発時刻と出発駅の組か、到着時刻と到着駅の組のリストを格納
Example : [ {"odpt:departureTime" : "06:00", "odpt:departureStation" : "odpt.Station:JR-East.ChuoRapid.Tokyo"}, {"odpt:arrivalTime" : "07:00", "odpt:arrivalStation" : "odpt.Station:JR-East.ChuoRapid.Takao"} ]

< odpt:trainTimetableObject > array

odpt:needExtraFee
optional

乗車券の他に別料金が必要か
Example : true

boolean (xsd:bool)

odpt:note
optional

その他プロパティとして定義されていない注釈情報の自然言語による記載（多言語対応）
Example : {"ja" : "日本語での注釈情報", "en" : "Note in English"}

object

odpt:trainTimetableObject

Name	Description	Schema
odpt:arrivalTime
optional

到着時刻 (ISO8601時刻形式)。出発時刻と到着時刻が異なる可能性がある場合は、到着時刻を記述する場合がある。
Example : "05:08"

string (odpt:Time)

odpt:arrivalStation
optional

到着駅のID (odpt:Stationのowl:sameAs)
Example : "odpt.Station:JR-East.ChuoRapid.Tokyo"

string (odpt:Station owl:sameAs)

odpt:departureTime
optional

出発時刻 (ISO8601時刻形式）
Example : "05:09"

string (odpt:Time)

odpt:departureStation
optional

出発駅のID (odpt:Stationのowl:sameAs)
Example : "odpt.Station:JR-East.ChuoRapid.Tokyo"

string (odpt:Station owl:sameAs)

odpt:platformNumber
optional

列車が到着するプラットフォームの番号
Example : "1"

string

odpt:platformName
optional

列車が到着 又は出発するプラットフォームの名称（多言語対応）
Example : {"ja" : "日本語名称", "en" : "English Name"}

object

odpt:note
optional

その他プロパティとして定義されていない注釈情報の自然言語による記載（多言語対応）
Example : {"ja" : "日本語での注釈情報", "en" : "Note in English"}

object

3.3.10. odpt:TrainType
普通、快速など、列車の種別を定義する

Name	Description	Schema
@context
required

JSON-LD仕様に基づく @context のURL
Example : "http://vocab.odpt.org/context_odpt.jsonld"

string (URL)

@id
required

固有識別子(ucode)
Example : "urn:ucode:_00001C000000000000010000030FD7E5"

string (URN)

@type
required

クラス名。odpt:TrainType
Example : "odpt:TrainType"

string

dc:date
optional

データ生成日時（ISO8601 日付時刻形式）
Example : "2017-01-13T15:10:00+09:00"

string (xsd:dateTime)

owl:sameAs
required

固有識別子。命名ルールは、odpt.TrainType:会社名.列車種別である。
Example : "odpt:JR-East.Local"

string (URL)

odpt:operator
required

運行会社を表すID (odpt:Operatorのowl:sameAs)
Example : "odpt.Operator:JR-East"

string (odpt:Operator owl:sameAs)

dc:title
optional

列車種別（日本語）
Example : "普通"

string

odpt:trainTypeTitle
optional

列車種別（多言語対応）
Example : {"ja" : "普通", "en" : "Local"}

object

4. ODPT Bus API
4.1. 概要
Bus API では、バスに関係した以下の6種類のデータを取得できる。

odpt:Bus

odpt:BusstopPole

odpt:BusroutePattern

odpt:BusstopPoleTimetable

odpt:BusroutePatternFare

odpt:BusTimetable

各データの内容については、それぞれの説明を参照すること。

4.1.1. 各データの関係性
バス(odpt:Bus) は、特定の運行系統(odpt:BusroutePatern)に沿って、運行される。

運行系統(odpt:BusroutePattern) は、停留所(標柱)(odpt:BusstopPole) の通過順で定義される。

バス路線(odpt:BusroutePattern odpt:busroute)は、複数の系統(odpt:BusroutePattern)で構成される。

同じ路線の系統は、同じ odpt:BusroutePattern odpt:busroute を持つ。

バス時刻表(odpt:BusTimetable)は、運行系統(odpt:BusroutePattern)の停留所通過順に沿った、停留所(標柱)の発着時刻の集まりとして定義される。

バス停(標柱)時刻表(odpt:BusstopPoleTimetable)は、バス停(標柱)(odpt:BusstopPole)から乗車可能なバスの時刻表である。

曜日区分（平日、土曜など）、行先や路線が異なるなどの理由で、ひとつのバス停(標柱)につき、複数の時刻表データが存在する。

運賃は、特定系統中の乗車標柱(odpt:BusstopPole)と特定系統中の降車標柱についての運賃情報として定義される。

4.1.2. バージョン情報
Version : 4.0.0

4.1.3. URIスキーム
Host : api.odpt.org
BasePath : /api/v4
Schemes : HTTPS

4.1.4. MIMEタイプ
application/json

4.2. パス
4.2.1. GET /api/v4/odpt:Bus
説明
バス車両の運行情報(odpt:Bus)を取得する。

パラメータ
Type	Name	Description	Schema
Query

acl:consumerKey
required

開発者サイトにて提供されるアクセストークン

string (acl:ConsumerKey)

Query

@id
optional

データに付与された固有識別子

string (URN)

Query

owl:sameAs
optional

データに付与された固有識別子の別名

string (URL)

Query

odpt:busroutePattern
optional

バス車両の運行系統のID (odpt:BusroutePatternのowl:sameAs)

string (odpt:BusroutePattern owl:sameAs)

Query

odpt:operator
optional

事業者のID (odpt:Operatorのowl:sameAs)

string (odpt:Operator owl:sameAs)

Query

odpt:fromBusstopPole
optional

直近に通過した、あるいは停車中のバス停のID (odpt:BusstopPoleのowl:sameAs)

string (odpt:BusstopPole owl:sameAs)

Query

odpt:toBusstopPole
optional

次に到着するバス停のID (odpt:BusstopPoleのowl:sameAs)

string (odpt:BusstopPole owl:sameAs)

レスポンス
HTTP Code	Description	Schema
200

正常終了

< odpt:Bus > array

400

パラメータ不正

No Content

401

acl:consumerKeyが誤っている

No Content

403

権限なし

No Content

404

該当データ無し

No Content

500

サーバー内部エラー

No Content

503

サービス利用不可

No Content

Example HTTP request
Request path
/api/v4/odpt:Bus?acl:consumerKey=string
Example HTTP response
Response 200
[ {
				    "@context" : "http://vocab.odpt.org/context_odpt_Bus.jsonld",
				    "@type" : "odpt:Bus",
				    "owl:sameAs" : "odpt.Bus:Toei.Ou57.40301.1.V366",
				    "odpt:busroute" : "odpt.Busroute:Toei.Ou57",
				    "odpt:operator" : "odpt.Operator:Toei",
				    "odpt:busNumber" : "V366",
				    "odpt:frequency" : 15,
				    "odpt:busroutePattern" : "odpt.BusroutePattern:Toei.Ou57.40301.1",
				    "odpt:fromBusstopPole" : "odpt.BusstopPole:Toei.Shimoicchoume.663.1",
				    "odpt:fromBusstopPoleTime" : "2017-11-22T14:54:42+09:00",
				    "odpt:toBusstopPole" : "odpt.BusstopPole:Toei.Kitashakoiriguchi.2294.1",
				    "odpt:startingBusstopPole" : "odpt.BusstopPole:Toei.Akabaneekihigashiguchi.21.1",
				    "odpt:terminalBusstopPole" : "odpt.BusstopPole:Toei.Toshimagochoumedanchi.1004.4",
				    "dc:date" : "2017-11-22T14:56:49+09:00",
				    "dct:valid" : "2017-11-22T14:57:04+09:00"
} ]
4.2.2. GET /api/v4/odpt:BusTimetable
説明
バス時刻表(odpt:BusTimetable)の取得

パラメータ
Type	Name	Description	Schema
Query

acl:consumerKey
required

開発者サイトにて提供されるアクセストークン

string (acl:ConsumerKey)

Query

@id
optional

データに付与された固有識別子

string (URN)

Query

owl:sameAs
optional

データに付与された固有識別子の別名

string (URL)

Query

odpt:operator
required

事業者のID (odpt:Operatorのowl:sameAs)

string (odpt:Operator owl:sameAs)

Query

odpt:busroutePattern
optional

対応する系統のID (odpt:BusroutePatternのowl:sameAs)

string (odpt:BusroutePattern owl:sameAs)

Query

dc:title
optional

バス路線名称（系統名等)

string

Query

odpt:calendar
optional

カレンダーのID (odpt:Calendarのowl:sameAs)

string (odpt:Calendar owl:sameAs)

レスポンス
HTTP Code	Description	Schema
200

正常終了

< odpt:BusTimetable > array

400

パラメータ不正

No Content

401

acl:consumerKeyが誤っている

No Content

403

権限なし

No Content

404

該当データ無し

No Content

500

サーバー内部エラー

No Content

503

サービス利用不可

No Content

Example HTTP request
Request path
/api/v4/odpt:BusTimetable?acl:consumerKey=string&odpt:operator=string
Example HTTP response
Response 200
[ {
				    "@context" : "http://vocab.odpt.org/context_odpt_BusTimetable.jsonld",
				    "@type" : "odpt:BusTimetable",
				    "owl:sameAs" : "odpt.BusTimetable:SeibuBus.NeriDaka01.1001.1.1.Weekday",
				    "dc:date" : "2017-11-15T09:57:34+09:00",
				    "dc:title" : "練高０１",
				    "odpt:operator" : "odpt.Operator:SeibuBus",
				    "odpt:busroutePattern" : "odpt.BusroutePattern:SeibuBus.NeriDaka01.1001.1",
				    "odpt:calendar" : "odpt.Calendar:Weekday",
				    "odpt:busTimetableObject" : [ {
				    "odpt:index" : 0,
				    "odpt:busstopPole" : "odpt.BusstopPole:SeibuBus.Nerimatakanodaieki.20053.1",
				    "odpt:departureTime" : "6:56",
				    "odpt:destinationSign" : "成増駅南口",
				    "odpt:isMidnight" : false,
				    "odpt:canGetOn" : true,
				    "odpt:canGetOff" : false
				    }, {
				    "odpt:index" : 1,
				    "odpt:busstopPole" : "odpt.BusstopPole:SeibuBus.Takanodaiicchoume.20054.1",
				    "odpt:arrivalTime" : "6:57",
				    "odpt:departureTime" : "6:57",
				    "odpt:destinationSign" : "成増駅南口",
				    "odpt:isMidnight" : false,
				    "odpt:canGetOn" : true,
				    "odpt:canGetOff" : true
				    }, {
				    "odpt:index" : 2,
				    "odpt:busstopPole" : "odpt.BusstopPole:SeibuBus.Yaharasanchoume.20069.5",
				    "odpt:arrivalTime" : "6:59",
				    "odpt:departureTime" : "6:59",
				    "odpt:destinationSign" : "成増駅南口",
				    "odpt:isMidnight" : false,
				    "odpt:canGetOn" : true,
				    "odpt:canGetOff" : true
				    }, {
				    "odpt:index" : 3,
				    "odpt:busstopPole" : "odpt.BusstopPole:SeibuBus.Hikarigaokaminamiiriguchi.20111.3",
				    "odpt:arrivalTime" : "7:00",
				    "odpt:departureTime" : "7:00",
				    "odpt:destinationSign" : "成増駅南口",
				    "odpt:isMidnight" : false,
				    "odpt:canGetOn" : true,
				    "odpt:canGetOff" : true
				    }, {
				    "odpt:index" : 4,
				    "odpt:busstopPole" : "odpt.BusstopPole:SeibuBus.Hikarigaokadainichuugakkou.20092.1",
				    "odpt:arrivalTime" : "7:03",
				    "odpt:departureTime" : "7:03",
				    "odpt:destinationSign" : "成増駅南口",
				    "odpt:isMidnight" : false,
				    "odpt:canGetOn" : true,
				    "odpt:canGetOff" : true
				    }, {
				    "odpt:index" : 5,
				    "odpt:busstopPole" : "odpt.BusstopPole:SeibuBus.Hikarigaokaminamidoori.20091.1",
				    "odpt:arrivalTime" : "7:03",
				    "odpt:departureTime" : "7:03",
				    "odpt:destinationSign" : "成増駅南口",
				    "odpt:isMidnight" : false,
				    "odpt:canGetOn" : true,
				    "odpt:canGetOff" : true
				    }, {
				    "odpt:index" : 6,
				    "odpt:busstopPole" : "odpt.BusstopPole:SeibuBus.Takamatsuyonchoume.20087.1",
				    "odpt:arrivalTime" : "7:04",
				    "odpt:departureTime" : "7:04",
				    "odpt:destinationSign" : "成増駅南口",
				    "odpt:isMidnight" : false,
				    "odpt:canGetOn" : true,
				    "odpt:canGetOff" : true
				    }, {
				    "odpt:index" : 7,
				    "odpt:busstopPole" : "odpt.BusstopPole:SeibuBus.Hikarigaokasanchoume.20086.1",
				    "odpt:arrivalTime" : "7:05",
				    "odpt:departureTime" : "7:05",
				    "odpt:destinationSign" : "成増駅南口",
				    "odpt:isMidnight" : false,
				    "odpt:canGetOn" : true,
				    "odpt:canGetOff" : true
				    }, {
				    "odpt:index" : 8,
				    "odpt:busstopPole" : "odpt.BusstopPole:SeibuBus.Hikarigaokaeki.20088.1",
				    "odpt:arrivalTime" : "7:09",
				    "odpt:departureTime" : "7:09",
				    "odpt:destinationSign" : "成増駅南口",
				    "odpt:isMidnight" : false,
				    "odpt:canGetOn" : true,
				    "odpt:canGetOff" : true
				    }, {
				    "odpt:index" : 9,
				    "odpt:busstopPole" : "odpt.BusstopPole:SeibuBus.Hikarigaokaima.20089.1",
				    "odpt:arrivalTime" : "7:09",
				    "odpt:departureTime" : "7:09",
				    "odpt:destinationSign" : "成増駅南口",
				    "odpt:isMidnight" : false,
				    "odpt:canGetOn" : true,
				    "odpt:canGetOff" : true
				    }, {
				    "odpt:index" : 10,
				    "odpt:busstopPole" : "odpt.BusstopPole:SeibuBus.Hikarigaokadanchi.20093.1",
				    "odpt:arrivalTime" : "7:10",
				    "odpt:departureTime" : "7:10",
				    "odpt:destinationSign" : "成増駅南口",
				    "odpt:isMidnight" : false,
				    "odpt:canGetOn" : true,
				    "odpt:canGetOff" : true
				    }, {
				    "odpt:index" : 11,
				    "odpt:busstopPole" : "odpt.BusstopPole:SeibuBus.Hikarigaokarokuchoume.20094.1",
				    "odpt:arrivalTime" : "7:11",
				    "odpt:departureTime" : "7:11",
				    "odpt:destinationSign" : "成増駅南口",
				    "odpt:isMidnight" : false,
				    "odpt:canGetOn" : true,
				    "odpt:canGetOff" : true
				    }, {
				    "odpt:index" : 12,
				    "odpt:busstopPole" : "odpt.BusstopPole:SeibuBus.Asahichouminamichikukuminkan.20095.1",
				    "odpt:arrivalTime" : "7:12",
				    "odpt:departureTime" : "7:12",
				    "odpt:destinationSign" : "成増駅南口",
				    "odpt:isMidnight" : false,
				    "odpt:canGetOn" : true,
				    "odpt:canGetOff" : true
				    }, {
				    "odpt:index" : 13,
				    "odpt:busstopPole" : "odpt.BusstopPole:SeibuBus.Hikarigaokakoukou.20098.1",
				    "odpt:arrivalTime" : "7:13",
				    "odpt:departureTime" : "7:13",
				    "odpt:destinationSign" : "成増駅南口",
				    "odpt:isMidnight" : false,
				    "odpt:canGetOn" : true,
				    "odpt:canGetOff" : true
				    }, {
				    "odpt:index" : 14,
				    "odpt:busstopPole" : "odpt.BusstopPole:SeibuBus.Asahichounichoume.20099.1",
				    "odpt:arrivalTime" : "7:14",
				    "odpt:departureTime" : "7:14",
				    "odpt:destinationSign" : "成増駅南口",
				    "odpt:isMidnight" : false,
				    "odpt:canGetOn" : true,
				    "odpt:canGetOff" : true
				    }, {
				    "odpt:index" : 15,
				    "odpt:busstopPole" : "odpt.BusstopPole:SeibuBus.Hikarigaokakouenkita.20100.1",
				    "odpt:arrivalTime" : "7:14",
				    "odpt:departureTime" : "7:14",
				    "odpt:destinationSign" : "成増駅南口",
				    "odpt:isMidnight" : false,
				    "odpt:canGetOn" : true,
				    "odpt:canGetOff" : true
				    }, {
				    "odpt:index" : 16,
				    "odpt:busstopPole" : "odpt.BusstopPole:SeibuBus.Asahichoutoeijuutakumae.20101.1",
				    "odpt:arrivalTime" : "7:15",
				    "odpt:departureTime" : "7:15",
				    "odpt:destinationSign" : "成増駅南口",
				    "odpt:isMidnight" : false,
				    "odpt:canGetOn" : true,
				    "odpt:canGetOff" : true
				    }, {
				    "odpt:index" : 17,
				    "odpt:busstopPole" : "odpt.BusstopPole:SeibuBus.Narimasuekiminamiguchi.20104.15",
				    "odpt:arrivalTime" : "7:22",
				    "odpt:isMidnight" : "false,",
				    "odpt:canGetOn" : "false,",
				    "odpt:canGetOff" : true
				    } ]
} ]
4.2.3. GET /api/v4/odpt:BusroutePattern
説明
運行系統情報(odpt:BusroutePattern)の取得

パラメータ
Type	Name	Description	Schema
Query

acl:consumerKey
required

開発者サイトにて提供されるアクセストークン

string (acl:ConsumerKey)

Query

@id
optional

データに付与された固有識別子

string (URN)

Query

owl:sameAs
optional

データに付与された固有識別子の別名

string (URL)

Query

dc:title
optional

路線・系統名称

string

Query

odpt:operator
optional

事業者のID (odpt:Operatorのowl:sameAs)

string (odpt:Operator owl:sameAs)

Query

odpt:busroute
optional

路線のID

string

レスポンス
HTTP Code	Description	Schema
200

正常終了

< odpt:BusroutePattern > array

400

パラメータ不正

No Content

401

acl:consumerKeyが誤っている

No Content

403

権限なし

No Content

404

該当データ無し

No Content

500

サーバー内部エラー

No Content

503

サービス利用不可

No Content

Example HTTP request
Request path
/api/v4/odpt:BusroutePattern?acl:consumerKey=string
Example HTTP response
Response 200
[ {
				    "@context" : "http://vocab.odpt.org/context_odpt_BusroutePattern.jsonld",
				    "@type" : "odpt:BusroutePattern",
				    "ow:sameAs" : "odpt.BusroutePattern:Toei.Ou57.40301.1",
				    "dc:date" : "2017-11-14T17:45:28+09:00",
				    "dc:title" : "王５７",
				    "odpt:kana" : "おう、ごじゅうなな",
				    "odpt:operator" : "odpt.Operator:Toei",
				    "odpt:busroute" : "odpt.Busroute:Toei.Ou57",
				    "odpt:pattern" : "40301",
				    "odpt:direction" : "1",
				    "odpt:busstopPoleOrder" : [ {
				    "odpt:busstopPole" : "odpt.BusstopPole:Toei.Akabaneekihigashiguchi.21.1",
				    "odpt:index" : 1
				    }, {
				    "odpt:busstopPole" : "odpt.BusstopPole:Toei.Akabanenichoume.23.1",
				    "odpt:index" : 2
				    }, {
				    "odpt:busstopPole" : "odpt.BusstopPole:Toei.Iwabuchimachi.126.1",
				    "odpt:index" : 3
				    }, {
				    "odpt:busstopPole" : "odpt.BusstopPole:Toei.Shimonichoume.664.1",
				    "odpt:index" : 4
				    }, {
				    "odpt:busstopPole" : "odpt.BusstopPole:Toei.Shimoicchoume.663.1",
				    "odpt:index" : 5
				    }, {
				    "odpt:busstopPole" : "odpt.BusstopPole:Toei.Kitashakoiriguchi.2294.1",
				    "odpt:index" : 6
				    }, {
				    "odpt:busstopPole" : "odpt.BusstopPole:Toei.Kitashakomae.407.2",
				    "odpt:index" : 7
				    }, {
				    "odpt:busstopPole" : "odpt.BusstopPole:Toei.Kamiyarikkyou.2290.3",
				    "odpt:index" : 8
				    }, {
				    "odpt:busstopPole" : "odpt.BusstopPole:Toei.Kitakukamiyachou.403.1",
				    "odpt:index" : 9
				    }, {
				    "odpt:busstopPole" : "odpt.BusstopPole:Toei.Oujigochoume.201.1",
				    "odpt:index" : 10
				    }, {
				    "odpt:busstopPole" : "odpt.BusstopPole:Toei.Oujiyonchoume.200.1",
				    "odpt:index" : 11
				    }, {
				    "odpt:busstopPole" : "odpt.BusstopPole:Toei.Oujisanchoume.199.1",
				    "odpt:index" : 12
				    }, {
				    "odpt:busstopPole" : "odpt.BusstopPole:Toei.Oujinichoume.198.1",
				    "odpt:index" : 13
				    }, {
				    "odpt:busstopPole" : "odpt.BusstopPole:Toei.Oujiekimae.196.10",
				    "odpt:index" : 14
				    }, {
				    "odpt:busstopPole" : "odpt.BusstopPole:Toei.Toshimanichoume.1001.2",
				    "odpt:index" : 15
				    }, {
				    "odpt:busstopPole" : "odpt.BusstopPole:Toei.Toshimasanchoume.1002.2",
				    "odpt:index" : 16
				    }, {
				    "odpt:busstopPole" : "odpt.BusstopPole:Toei.Toshimayonchoume.1003.1",
				    "odpt:index" : 17
				    }, {
				    "odpt:busstopPole" : "odpt.BusstopPole:Toei.Toshimarokuchoume.1007.2",
				    "odpt:index" : 18
				    }, {
				    "odpt:busstopPole" : "odpt.BusstopPole:Toei.Toshimagochoumedanchi.1004.4",
				    "odpt:index" : 19
				    } ]
} ]
4.2.4. GET /api/v4/odpt:BusroutePatternFare
説明
運賃情報(odpt:BusroutePatternFare)の取得

パラメータ
Type	Name	Description	Schema
Query

acl:consumerKey
required

開発者サイトにて提供されるアクセストークン

string (acl:ConsumerKey)

Query

@id
optional

データに付与された固有識別子

string (URN)

Query

owl:sameAs
optional

データに付与された固有識別子の別名

string (URL)

Query

odpt:operator
optional

事業者のID (odpt:Operatorのowl:sameAs)

string (odpt:Operator owl:sameAs)

Query

odpt:fromBusstopPole
optional

乗車バス停(標柱)のID (odpt:BusstopPoleのowl:sameAs)

string (odpt:BusstopPole owl:sameAs)

Query

odpt:toBusstopPole
optional

降車バス停(標柱)のID (odpt:BusstopPoleのowl:sameAs)

string (odpt:BusstopPole owl:sameAs)

Query

odpt:ticketFare
optional

切符利用時の運賃

integer

Query

odpt:childTicketFare
optional

切符利用時の子供運賃

integer

Query

odpt:icCardFare
optional

ICカード利用時の運賃

integer

Query

odpt:childIcCardFare
optional

ICカード利用時の子供運賃

integer

レスポンス
HTTP Code	Description	Schema
200

正常終了

< odpt:BusroutePatternFare > array

400

パラメータ不正

No Content

401

acl:consumerKeyが誤っている

No Content

403

権限なし

No Content

404

該当データ無し

No Content

500

サーバー内部エラー

No Content

503

サービス利用不可

No Content

Example HTTP request
Request path
/api/v4/odpt:BusroutePatternFare?acl:consumerKey=string
Example HTTP response
Response 200
[ {
				    "@context" : "http://vocab.odpt.org/context_odpt_BusroutePatternFare.jsonld",
				    "@type" : "odpt:BusroutePatternFare",
				    "owl:sameAs" : "odpt.BusroutePatternFare:Toei.Ou57.40301.1.1.Akabaneekihigashiguchi.Toei.Ou57.40301.1.2.Akabanenichoume",
				    "dc:date" : "2017-11-14T17:45:31+09:00",
				    "odpt:operator" : "odpt.Operator:Toei",
				    "odpt:fromBusroutePattern" : "odpt.BusroutePattern:Toei.Ou57.40301.1",
				    "odpt:fromBusstopPoleOrder" : 1,
				    "odpt:fromBusstopPole" : "odpt.BusstopPole:Toei.Akabaneekihigashiguchi.21.1",
				    "odpt:toBusroutePattern" : "odpt.BusroutePattern:Toei.Ou57.40301.1",
				    "odpt:toBusstopPoleOrder" : 2,
				    "odpt:toBusstopPole" : "odpt.BusstopPole:Toei.Akabanenichoume.23.1",
				    "odpt:ticketFare" : 210,
				    "odpt:childTicketFare" : 110,
				    "odpt:icCardFare" : 206,
				    "odpt:childIcCardFare" : 103
} ]
4.2.5. GET /api/v4/odpt:BusstopPole
説明
バス停(標柱)(odpt:BusstopPole)の取得

パラメータ
Type	Name	Description	Schema
Query

acl:consumerKey
required

開発者サイトにて提供されるアクセストークン

string (acl:ConsumerKey)

Query

@id
optional

データに付与された固有識別子

string (URN)

Query

owl:sameAs
optional

データに付与された固有識別子の別名

string (URL)

Query

dc:title
optional

停留所名称

string

Query

odpt:busstopPoleNumber
optional

標柱番号

string

Query

odpt:platformNumber
optional

のりば番号

string

Query

odpt:busroutePattern
optional

標柱で発着する系統のID (odpt:BusroutePatternのowl:sameAs)

string (odpt:BusroutePattern owl:sameAs)

Query

odpt:operator
optional

事業者のID (odpt:Operatorのowl:sameAs)

string (odpt:Operator owl:sameAs)

レスポンス
HTTP Code	Description	Schema
200

正常終了

< odpt:BusstopPole > array

400

パラメータ不正

No Content

401

acl:consumerKeyが誤っている

No Content

403

権限なし

No Content

404

該当データ無し

No Content

500

サーバー内部エラー

No Content

503

サービス利用不可

No Content

Example HTTP request
Request path
/api/v4/odpt:BusstopPole?acl:consumerKey=string
Example HTTP response
Response 200
[ {
				    "@context" : "http://vocab.odpt.org/context_odpt_BusstopPole.jsonld,",
				    "@type" : "odpt:BusstopPole",
				    "owl:sameAs" : "odpt.BusstopPole:Toei.Akabaneekihigashiguchi.21.1",
				    "dc:date" : "2017-11-14T17:44:05+09:00",
				    "dc:title" : "赤羽駅東口",
				    "odpt:kana" : "あかばねえきひがしぐち",
				    "geo:long" : 139.7214941,
				    "geo:lat" : 35.7790549,
				    "odpt:busroutePattern" : [ "odpt.BusroutePattern:Toei.Ou57.40301.1", "odpt.BusroutePattern:Toei.Ou57.40301.2", "odpt.BusroutePattern:Toei.Ou57.40302.2" ],
				    "odpt:operator" : [ "odpt.Operator:Toei" ],
				    "odpt:busstopPoleNumber" : "1",
				    "odpt:busstopTimetable" : [ "odpt.BusstopPoleTimetable:Toei.Ou57.Akabaneekihigashiguchi.21.1.Toshimagochoumedanchi.Holiday", "odpt.BusstopPoleTimetable:Toei.Ou57.Akabaneekihigashiguchi.21.1.Toshimagochoumedanchi.Saturday", "odpt.BusstopPoleTimetable:Toei.Ou57.Akabaneekihigashiguchi.21.1.Toshimagochoumedanchi.Weekday" ]
} ]
4.2.6. GET /api/v4/odpt:BusstopPoleTimetable
説明
バス停(標柱)時刻表(odpt:BusstopPoleTimetable) の取得

パラメータ
Type	Name	Description	Schema
Query

acl:consumerKey
required

開発者サイトにて提供されるアクセストークン

string (acl:ConsumerKey)

Query

@id
optional

データに付与された固有識別子

string (URN)

Query

owl:sameAs
optional

データに付与された固有識別子の別名

string (URL)

Query

odpt:busstopPole
optional

時刻表の対応するバス停(標柱)のID (odpt:BusstopPoleのowl:sameAs)

string (odpt:BusstopPole owl:sameAs)

Query

odpt:busDirection
optional

方面のID

string

Query

odpt:busroute
optional

路線のID

string

Query

odpt:operator
optional

事業者のID (odpt:Operatorのowl:sameAs)

string (odpt:Operator owl:sameAs)

Query

odpt:calendar
optional

カレンダーのID (odpt:Calendarのowl:sameAs)

string (odpt:Calendar owl:sameAs)

Query

dc:date
optional

データ生成日付

string (xsd:dateTime)

レスポンス
HTTP Code	Description	Schema
200

正常終了

< odpt:BusstopPoleTimetable > array

400

パラメータ不正

No Content

401

acl:consumerKeyが誤っている

No Content

403

権限なし

No Content

404

該当データ無し

No Content

500

サーバー内部エラー

No Content

503

サービス利用不可

No Content

Example HTTP request
Request path
/api/v4/odpt:BusstopPoleTimetable?acl:consumerKey=string
Example HTTP response
Response 200
[ {
				    "@context" : "http://vocab.odpt.org/context_odpt_BusstopPoleTimetable.jsonld",
				    "@type" : "odpt:BusstopPoleTimetable",
				    "owl:sameAs" : "odpt.BusstopPoleTimetable:Toei.Ou57.Akabaneekihigashiguchi.21.1.Toshimagochoumedanchi.Weekday",
				    "dc:date" : "2017-11-14T17:29:41+09:00",
				    "dc:title" : "王５７:赤羽駅東口:豊島五丁目団地行:平日",
				    "odpt:busstopPole" : "odpt.BusstopPole:Toei.Akabaneekihigashiguchi.21.1",
				    "odpt:busDirection" : "odpt.BusDirection:Toei.Toshimagochoumedanchi",
				    "odpt:busroute" : "odpt.Busroute:Toei.Ou57",
				    "odpt:operator" : "odpt.Operator:Toei",
				    "odpt:calendar" : "odpt.Calendar:Weekday",
				    "odpt:busstopPoleTimetableObject" : [ {
				    "odpt:departureTime" : "06:21",
				    "odpt:destinationBusstopPole" : "odpt.BusstopPole:Toei.Toshimagochoumedanchi.1004.4",
				    "odpt:destinationSign" : "豊島五丁目団地行",
				    "odpt:isNonStepBus" : true,
				    "odpt:isMidnight" : false
				    }, {
				    "odpt:departureTime" : "06:35",
				    "odpt:destinationBusstopPole" : "odpt.BusstopPole:Toei.Toshimagochoumedanchi.1004.4",
				    "odpt:destinationSign" : "豊島五丁目団地行",
				    "odpt:isNonStepBus" : true,
				    "odpt:isMidnight" : false
				    }, {
				    "odpt:departureTime" : "06:52",
				    "odpt:destinationBusstopPole" : "odpt.BusstopPole:Toei.Toshimagochoumedanchi.1004.4",
				    "odpt:destinationSign" : "豊島五丁目団地行",
				    "odpt:isNonStepBus" : true,
				    "odpt:isMidnight" : false
				    }, {
				    "odpt:departureTime" : "07:05",
				    "odpt:destinationBusstopPole" : "odpt.BusstopPole:Toei.Toshimagochoumedanchi.1004.4",
				    "odpt:destinationSign" : "豊島五丁目団地行",
				    "odpt:isNonStepBus" : true,
				    "odpt:isMidnight" : false
				    }, {
				    "odpt:departureTime" : "07:17",
				    "odpt:destinationBusstopPole" : "odpt.BusstopPole:Toei.Toshimagochoumedanchi.1004.4",
				    "odpt:destinationSign" : "豊島五丁目団地行",
				    "odpt:isNonStepBus" : true,
				    "odpt:isMidnight" : false
				    }, {
				    "odpt:departureTime" : "07:29",
				    "odpt:destinationBusstopPole" : "odpt.BusstopPole:Toei.Toshimagochoumedanchi.1004.4",
				    "odpt:destinationSign" : "豊島五丁目団地行",
				    "odpt:isNonStepBus" : true,
				    "odpt:isMidnight" : false
				    }, {
				    "odpt:departureTime" : "07:39",
				    "odpt:destinationBusstopPole" : "odpt.BusstopPole:Toei.Toshimagochoumedanchi.1004.4",
				    "odpt:destinationSign" : "豊島五丁目団地行",
				    "odpt:isNonStepBus" : true,
				    "odpt:isMidnight" : false
				    }, {
				    "odpt:departureTime" : "07:49",
				    "odpt:destinationBusstopPole" : "odpt.BusstopPole:Toei.Toshimagochoumedanchi.1004.4",
				    "odpt:destinationSign" : "豊島五丁目団地行",
				    "odpt:isNonStepBus" : true,
				    "odpt:isMidnight" : false
				    }, {
				    "odpt:departureTime" : "08:00",
				    "odpt:destinationBusstopPole" : "odpt.BusstopPole:Toei.Toshimagochoumedanchi.1004.4",
				    "odpt:destinationSign" : "豊島五丁目団地行",
				    "odpt:isNonStepBus" : true,
				    "odpt:isMidnight" : false
				    }, {
				    "odpt:departureTime" : "08:10",
				    "odpt:destinationBusstopPole" : "odpt.BusstopPole:Toei.Toshimagochoumedanchi.1004.4",
				    "odpt:destinationSign" : "豊島五丁目団地行",
				    "odpt:isNonStepBus" : true,
				    "odpt:isMidnight" : false
				    }, {
				    "odpt:departureTime" : "08:21",
				    "odpt:destinationBusstopPole" : "odpt.BusstopPole:Toei.Toshimagochoumedanchi.1004.4",
				    "odpt:destinationSign" : "豊島五丁目団地行",
				    "odpt:isNonStepBus" : true,
				    "odpt:isMidnight" : false
				    }, {
				    "odpt:departureTime" : "08:32",
				    "odpt:destinationBusstopPole" : "odpt.BusstopPole:Toei.Toshimagochoumedanchi.1004.4",
				    "odpt:destinationSign" : "豊島五丁目団地行",
				    "odpt:isNonStepBus" : true,
				    "odpt:isMidnight" : false
				    }, {
				    "odpt:departureTime" : "08:44",
				    "odpt:destinationBusstopPole" : "odpt.BusstopPole:Toei.Toshimagochoumedanchi.1004.4",
				    "odpt:destinationSign" : "豊島五丁目団地行",
				    "odpt:isNonStepBus" : true,
				    "odpt:isMidnight" : false
				    }, {
				    "odpt:departureTime" : "08:55",
				    "odpt:destinationBusstopPole" : "odpt.BusstopPole:Toei.Toshimagochoumedanchi.1004.4",
				    "odpt:destinationSign" : "豊島五丁目団地行",
				    "odpt:isNonStepBus" : true,
				    "odpt:isMidnight" : false
				    }, {
				    "odpt:departureTime" : "09:07",
				    "odpt:destinationBusstopPole" : "odpt.BusstopPole:Toei.Toshimagochoumedanchi.1004.4",
				    "odpt:destinationSign" : "豊島五丁目団地行",
				    "odpt:isNonStepBus" : true,
				    "odpt:isMidnight" : false
				    }, {
				    "odpt:departureTime" : "09:18",
				    "odpt:destinationBusstopPole" : "odpt.BusstopPole:Toei.Toshimagochoumedanchi.1004.4",
				    "odpt:destinationSign" : "豊島五丁目団地行",
				    "odpt:isNonStepBus" : true,
				    "odpt:isMidnight" : false
				    }, {
				    "odpt:departureTime" : "09:30",
				    "odpt:destinationBusstopPole" : "odpt.BusstopPole:Toei.Toshimagochoumedanchi.1004.4",
				    "odpt:destinationSign" : "豊島五丁目団地行",
				    "odpt:isNonStepBus" : true,
				    "odpt:isMidnight" : false
				    }, {
				    "odpt:departureTime" : "09:42",
				    "odpt:destinationBusstopPole" : "odpt.BusstopPole:Toei.Toshimagochoumedanchi.1004.4",
				    "odpt:destinationSign" : "豊島五丁目団地行",
				    "odpt:isNonStepBus" : true,
				    "odpt:isMidnight" : false
				    }, {
				    "odpt:departureTime" : "09:54",
				    "odpt:destinationBusstopPole" : "odpt.BusstopPole:Toei.Toshimagochoumedanchi.1004.4",
				    "odpt:destinationSign" : "豊島五丁目団地行",
				    "odpt:isNonStepBus" : true,
				    "odpt:isMidnight" : false
				    }, {
				    "odpt:departureTime" : "10:07",
				    "odpt:destinationBusstopPole" : "odpt.BusstopPole:Toei.Toshimagochoumedanchi.1004.4",
				    "odpt:destinationSign" : "豊島五丁目団地行",
				    "odpt:isNonStepBus" : true,
				    "odpt:isMidnight" : false
				    }, {
				    "odpt:departureTime" : "10:19",
				    "odpt:destinationBusstopPole" : "odpt.BusstopPole:Toei.Toshimagochoumedanchi.1004.4",
				    "odpt:destinationSign" : "豊島五丁目団地行",
				    "odpt:isNonStepBus" : true,
				    "odpt:isMidnight" : false
				    }, {
				    "odpt:departureTime" : "10:28",
				    "odpt:destinationBusstopPole" : "odpt.BusstopPole:Toei.Toshimagochoumedanchi.1004.4",
				    "odpt:destinationSign" : "豊島五丁目団地行",
				    "odpt:isNonStepBus" : true,
				    "odpt:isMidnight" : false
				    }, {
				    "odpt:departureTime" : "10:40",
				    "odpt:destinationBusstopPole" : "odpt.BusstopPole:Toei.Toshimagochoumedanchi.1004.4",
				    "odpt:destinationSign" : "豊島五丁目団地行",
				    "odpt:isNonStepBus" : true,
				    "odpt:isMidnight" : false
				    }, {
				    "odpt:departureTime" : "10:52",
				    "odpt:destinationBusstopPole" : "odpt.BusstopPole:Toei.Toshimagochoumedanchi.1004.4",
				    "odpt:destinationSign" : "豊島五丁目団地行",
				    "odpt:isNonStepBus" : true,
				    "odpt:isMidnight" : false
				    }, {
				    "odpt:departureTime" : "11:08",
				    "odpt:destinationBusstopPole" : "odpt.BusstopPole:Toei.Toshimagochoumedanchi.1004.4",
				    "odpt:destinationSign" : "豊島五丁目団地行",
				    "odpt:isNonStepBus" : true,
				    "odpt:isMidnight" : false
				    }, {
				    "odpt:departureTime" : "11:24",
				    "odpt:destinationBusstopPole" : "odpt.BusstopPole:Toei.Toshimagochoumedanchi.1004.4",
				    "odpt:destinationSign" : "豊島五丁目団地行",
				    "odpt:isNonStepBus" : true,
				    "odpt:isMidnight" : false
				    }, {
				    "odpt:departureTime" : "11:38",
				    "odpt:destinationBusstopPole" : "odpt.BusstopPole:Toei.Toshimagochoumedanchi.1004.4",
				    "odpt:destinationSign" : "豊島五丁目団地行",
				    "odpt:isNonStepBus" : true,
				    "odpt:isMidnight" : false
				    }, {
				    "odpt:departureTime" : "11:52",
				    "odpt:destinationBusstopPole" : "odpt.BusstopPole:Toei.Toshimagochoumedanchi.1004.4",
				    "odpt:destinationSign" : "豊島五丁目団地行",
				    "odpt:isNonStepBus" : true,
				    "odpt:isMidnight" : false
				    }, {
				    "odpt:departureTime" : "12:06",
				    "odpt:destinationBusstopPole" : "odpt.BusstopPole:Toei.Toshimagochoumedanchi.1004.4",
				    "odpt:destinationSign" : "豊島五丁目団地行",
				    "odpt:isNonStepBus" : true,
				    "odpt:isMidnight" : false
				    }, {
				    "odpt:departureTime" : "12:19",
				    "odpt:destinationBusstopPole" : "odpt.BusstopPole:Toei.Toshimagochoumedanchi.1004.4",
				    "odpt:destinationSign" : "豊島五丁目団地行",
				    "odpt:isNonStepBus" : true,
				    "odpt:isMidnight" : false
				    }, {
				    "odpt:departureTime" : "12:35",
				    "odpt:destinationBusstopPole" : "odpt.BusstopPole:Toei.Toshimagochoumedanchi.1004.4",
				    "odpt:destinationSign" : "豊島五丁目団地行",
				    "odpt:isNonStepBus" : true,
				    "odpt:isMidnight" : false
				    }, {
				    "odpt:departureTime" : "12:50",
				    "odpt:destinationBusstopPole" : "odpt.BusstopPole:Toei.Toshimagochoumedanchi.1004.4",
				    "odpt:destinationSign" : "豊島五丁目団地行",
				    "odpt:isNonStepBus" : true,
				    "odpt:isMidnight" : false
				    }, {
				    "odpt:departureTime" : "12:50",
				    "odpt:destinationBusstopPole" : "odpt.BusstopPole:Toei.Toshimagochoumedanchi.1004.4",
				    "odpt:destinationSign" : "豊島五丁目団地行",
				    "odpt:isNonStepBus" : true,
				    "odpt:isMidnight" : false
				    }, {
				    "odpt:departureTime" : "13:04",
				    "odpt:destinationBusstopPole" : "odpt.BusstopPole:Toei.Toshimagochoumedanchi.1004.4",
				    "odpt:destinationSign" : "豊島五丁目団地行",
				    "odpt:isNonStepBus" : true,
				    "odpt:isMidnight" : false
				    }, {
				    "odpt:departureTime" : "13:18",
				    "odpt:destinationBusstopPole" : "odpt.BusstopPole:Toei.Toshimagochoumedanchi.1004.4",
				    "odpt:destinationSign" : "豊島五丁目団地行",
				    "odpt:isNonStepBus" : true,
				    "odpt:isMidnight" : false
				    }, {
				    "odpt:departureTime" : "13:32",
				    "odpt:destinationBusstopPole" : "odpt.BusstopPole:Toei.Toshimagochoumedanchi.1004.4",
				    "odpt:destinationSign" : "豊島五丁目団地行",
				    "odpt:isNonStepBus" : true,
				    "odpt:isMidnight" : false
				    }, {
				    "odpt:departureTime" : "13:46",
				    "odpt:destinationBusstopPole" : "odpt.BusstopPole:Toei.Toshimagochoumedanchi.1004.4",
				    "odpt:destinationSign" : "豊島五丁目団地行",
				    "odpt:isNonStepBus" : true,
				    "odpt:isMidnight" : false
				    }, {
				    "odpt:departureTime" : "14:01",
				    "odpt:destinationBusstopPole" : "odpt.BusstopPole:Toei.Toshimagochoumedanchi.1004.4",
				    "odpt:destinationSign" : "豊島五丁目団地行",
				    "odpt:isNonStepBus" : true,
				    "odpt:isMidnight" : false
				    }, {
				    "odpt:departureTime" : "14:16",
				    "odpt:destinationBusstopPole" : "odpt.BusstopPole:Toei.Toshimagochoumedanchi.1004.4",
				    "odpt:destinationSign" : "豊島五丁目団地行",
				    "odpt:isNonStepBus" : true,
				    "odpt:isMidnight" : false
				    }, {
				    "odpt:departureTime" : "14:32",
				    "odpt:destinationBusstopPole" : "odpt.BusstopPole:Toei.Toshimagochoumedanchi.1004.4",
				    "odpt:destinationSign" : "豊島五丁目団地行",
				    "odpt:isNonStepBus" : true,
				    "odpt:isMidnight" : false
				    }, {
				    "odpt:departureTime" : "14:47",
				    "odpt:destinationBusstopPole" : "odpt.BusstopPole:Toei.Toshimagochoumedanchi.1004.4",
				    "odpt:destinationSign" : "豊島五丁目団地行",
				    "odpt:isNonStepBus" : true,
				    "odpt:isMidnight" : false
				    }, {
				    "odpt:departureTime" : "15:01",
				    "odpt:destinationBusstopPole" : "odpt.BusstopPole:Toei.Toshimagochoumedanchi.1004.4",
				    "odpt:destinationSign" : "豊島五丁目団地行",
				    "odpt:isNonStepBus" : true,
				    "odpt:isMidnight" : false
				    }, {
				    "odpt:departureTime" : "15:15",
				    "odpt:destinationBusstopPole" : "odpt.BusstopPole:Toei.Toshimagochoumedanchi.1004.4",
				    "odpt:destinationSign" : "豊島五丁目団地行",
				    "odpt:isNonStepBus" : true,
				    "odpt:isMidnight" : false
				    }, {
				    "odpt:departureTime" : "15:30",
				    "odpt:destinationBusstopPole" : "odpt.BusstopPole:Toei.Toshimagochoumedanchi.1004.4",
				    "odpt:destinationSign" : "豊島五丁目団地行",
				    "odpt:isNonStepBus" : true,
				    "odpt:isMidnight" : false
				    }, {
				    "odpt:departureTime" : "15:46",
				    "odpt:destinationBusstopPole" : "odpt.BusstopPole:Toei.Toshimagochoumedanchi.1004.4",
				    "odpt:destinationSign" : "豊島五丁目団地行",
				    "odpt:isNonStepBus" : true,
				    "odpt:isMidnight" : false
				    }, {
				    "odpt:departureTime" : "16:02",
				    "odpt:destinationBusstopPole" : "odpt.BusstopPole:Toei.Toshimagochoumedanchi.1004.4",
				    "odpt:destinationSign" : "豊島五丁目団地行",
				    "odpt:isNonStepBus" : true,
				    "odpt:isMidnight" : false
				    }, {
				    "odpt:departureTime" : "16:17",
				    "odpt:destinationBusstopPole" : "odpt.BusstopPole:Toei.Toshimagochoumedanchi.1004.4",
				    "odpt:destinationSign" : "豊島五丁目団地行",
				    "odpt:isNonStepBus" : true,
				    "odpt:isMidnight" : false
				    }, {
				    "odpt:departureTime" : "16:31",
				    "odpt:destinationBusstopPole" : "odpt.BusstopPole:Toei.Toshimagochoumedanchi.1004.4",
				    "odpt:destinationSign" : "豊島五丁目団地行",
				    "odpt:isNonStepBus" : true,
				    "odpt:isMidnight" : false
				    }, {
				    "odpt:departureTime" : "16:45",
				    "odpt:destinationBusstopPole" : "odpt.BusstopPole:Toei.Toshimagochoumedanchi.1004.4",
				    "odpt:destinationSign" : "豊島五丁目団地行",
				    "odpt:isNonStepBus" : true,
				    "odpt:isMidnight" : false
				    }, {
				    "odpt:departureTime" : "17:00",
				    "odpt:destinationBusstopPole" : "odpt.BusstopPole:Toei.Toshimagochoumedanchi.1004.4",
				    "odpt:destinationSign" : "豊島五丁目団地行",
				    "odpt:isNonStepBus" : true,
				    "odpt:isMidnight" : false
				    }, {
				    "odpt:departureTime" : "17:15",
				    "odpt:destinationBusstopPole" : "odpt.BusstopPole:Toei.Toshimagochoumedanchi.1004.4",
				    "odpt:destinationSign" : "豊島五丁目団地行",
				    "odpt:isNonStepBus" : true,
				    "odpt:isMidnight" : false
				    }, {
				    "odpt:departureTime" : "17:30",
				    "odpt:destinationBusstopPole" : "odpt.BusstopPole:Toei.Toshimagochoumedanchi.1004.4",
				    "odpt:destinationSign" : "豊島五丁目団地行",
				    "odpt:isNonStepBus" : true,
				    "odpt:isMidnight" : false
				    }, {
				    "odpt:departureTime" : "17:45",
				    "odpt:destinationBusstopPole" : "odpt.BusstopPole:Toei.Toshimagochoumedanchi.1004.4",
				    "odpt:destinationSign" : "豊島五丁目団地行",
				    "odpt:isNonStepBus" : true,
				    "odpt:isMidnight" : false
				    }, {
				    "odpt:departureTime" : "18:00",
				    "odpt:destinationBusstopPole" : "odpt.BusstopPole:Toei.Toshimagochoumedanchi.1004.4",
				    "odpt:destinationSign" : "豊島五丁目団地行",
				    "odpt:isNonStepBus" : true,
				    "odpt:isMidnight" : false
				    }, {
				    "odpt:departureTime" : "18:15",
				    "odpt:destinationBusstopPole" : "odpt.BusstopPole:Toei.Toshimagochoumedanchi.1004.4",
				    "odpt:destinationSign" : "豊島五丁目団地行",
				    "odpt:isNonStepBus" : true,
				    "odpt:isMidnight" : false
				    }, {
				    "odpt:departureTime" : "18:30",
				    "odpt:destinationBusstopPole" : "odpt.BusstopPole:Toei.Toshimagochoumedanchi.1004.4",
				    "odpt:destinationSign" : "豊島五丁目団地行",
				    "odpt:isNonStepBus" : true,
				    "odpt:isMidnight" : false
				    }, {
				    "odpt:departureTime" : "18:45",
				    "odpt:destinationBusstopPole" : "odpt.BusstopPole:Toei.Toshimagochoumedanchi.1004.4",
				    "odpt:destinationSign" : "豊島五丁目団地行",
				    "odpt:isNonStepBus" : true,
				    "odpt:isMidnight" : false
				    }, {
				    "odpt:departureTime" : "19:00",
				    "odpt:destinationBusstopPole" : "odpt.BusstopPole:Toei.Toshimagochoumedanchi.1004.4",
				    "odpt:destinationSign" : "豊島五丁目団地行",
				    "odpt:isNonStepBus" : true,
				    "odpt:isMidnight" : false
				    }, {
				    "odpt:departureTime" : "19:14",
				    "odpt:destinationBusstopPole" : "odpt.BusstopPole:Toei.Toshimagochoumedanchi.1004.4",
				    "odpt:destinationSign" : "豊島五丁目団地行",
				    "odpt:isNonStepBus" : true,
				    "odpt:isMidnight" : false
				    }, {
				    "odpt:departureTime" : "19:34",
				    "odpt:destinationBusstopPole" : "odpt.BusstopPole:Toei.Toshimagochoumedanchi.1004.4",
				    "odpt:destinationSign" : "豊島五丁目団地行",
				    "odpt:isNonStepBus" : true,
				    "odpt:isMidnight" : false
				    }, {
				    "odpt:departureTime" : "19:54",
				    "odpt:destinationBusstopPole" : "odpt.BusstopPole:Toei.Toshimagochoumedanchi.1004.4",
				    "odpt:destinationSign" : "豊島五丁目団地行",
				    "odpt:isNonStepBus" : true,
				    "odpt:isMidnight" : false
				    }, {
				    "odpt:departureTime" : "20:15",
				    "odpt:destinationBusstopPole" : "odpt.BusstopPole:Toei.Toshimagochoumedanchi.1004.4",
				    "odpt:destinationSign" : "豊島五丁目団地行",
				    "odpt:isNonStepBus" : true,
				    "odpt:isMidnight" : false
				    }, {
				    "odpt:departureTime" : "20:36",
				    "odpt:destinationBusstopPole" : "odpt.BusstopPole:Toei.Toshimagochoumedanchi.1004.4",
				    "odpt:destinationSign" : "豊島五丁目団地行",
				    "odpt:isNonStepBus" : true,
				    "odpt:isMidnight" : false
				    }, {
				    "odpt:departureTime" : "21:00",
				    "odpt:destinationBusstopPole" : "odpt.BusstopPole:Toei.Toshimagochoumedanchi.1004.4",
				    "odpt:destinationSign" : "豊島五丁目団地行",
				    "odpt:isNonStepBus" : true,
				    "odpt:isMidnight" : false
				    }, {
				    "odpt:departureTime" : "21:29",
				    "odpt:destinationBusstopPole" : "odpt.BusstopPole:Toei.Toshimagochoumedanchi.1004.4",
				    "odpt:destinationSign" : "豊島五丁目団地行",
				    "odpt:isNonStepBus" : true,
				    "odpt:isMidnight" : false
				    }, {
				    "odpt:departureTime" : "21:52",
				    "odpt:destinationBusstopPole" : "odpt.BusstopPole:Toei.Toshimagochoumedanchi.1004.4",
				    "odpt:destinationSign" : "豊島五丁目団地行",
				    "odpt:isNonStepBus" : true,
				    "odpt:isMidnight" : false
				    }, {
				    "odpt:departureTime" : "22:12",
				    "odpt:destinationBusstopPole" : "odpt.BusstopPole:Toei.Toshimagochoumedanchi.1004.4",
				    "odpt:destinationSign" : "豊島五丁目団地行",
				    "odpt:isNonStepBus" : true,
				    "odpt:isMidnight" : false
				    }, {
				    "odpt:departureTime" : "22:40",
				    "odpt:destinationBusstopPole" : "odpt.BusstopPole:Toei.Toshimagochoumedanchi.1004.4",
				    "odpt:destinationSign" : "豊島五丁目団地行",
				    "odpt:isNonStepBus" : true,
				    "odpt:isMidnight" : false
				    } ]
} ]
4.3. 定義
4.3.1. odpt:Bus
odpt:Busは、バスの運行情報を示すクラスである。

odpt:busroutePattern が運行中の系統を示し、 odpt:fromBusstopPole, odpt:toBusstopPole で現在位置を示す。

現在位置	odpt:fromBusstopPole	odpt:toBusstopPole
Aバス停とBバス停の間

Aバス停

Bバス停

Aバス停に停車中

Aバス停

null

Bバス停に接近中

null

Bバス停

接近中の判別がつかない場合は、odpt:fromBusstopPole は null とはならない場合がある。

停車中の判別がつかない場合は、odpt:toBusstopPole は null とはならない場合がある。

odpt:occupancyStatus は車両の混雑度を示す。

値域	説明
odpt.OccupancyStatus:Empty　　　　　　　　　

車両はほぼ空席

odpt.OccupancyStatus:ManySeatsAvailable

車両に多くの空席あり

odpt.OccupancyStatus:FewSeatsAvailable

車両に少々の空席あり

odpt.OccupancyStatus:StandingRoomOnly

車両に空席なし。立っていれば乗車可能

odpt.OccupancyStatus:CrushedStandingRoomOnly

車両に空席なし。立っていてば乗車可能だが、場所は限られる

odpt.OccupancyStatus:FullRoomOnly

ほぼ満員

odpt.OccupancyStatus:NotAcceptingPassengers

乗車不可

Name	Description	Schema
@context
required

JSON-LD仕様に基づく @context のURL
Example : "http://vocab.odpt.org/context_odpt.jsonld"

string (URL)

@id
required

固有識別子
Example : "string"

string (URN)

@type
required

バス運行情報のクラス名、"odpt:Bus"が入る
Example : "odpt:Bus"

string

owl:sameAs
required

バス運行情報の固有識別子
Example : "string"

string (URL)

odpt:busNumber
required

バス車両番号
Example : "string"

string

dc:date
required

データ生成時刻
Example : "2017-01-13T15:10:00+09:00"

string (xsd:dateTime)

dct:valid
required

データ保証期限
Example : "2017-01-13T15:10:00+09:00"

string (xsd:dateTime)

odpt:frequency
required

更新頻度（秒）、指定された秒数以降にリクエストを行うことで、最新値が取得される。
Example : 60

integer

odpt:busroutePattern
required

運行中の系統のID (odpt:BusroutePatternのowl:sameAs)
Example : "string"

string (odpt:BusroutePattern owl:sameAs)

odpt:busTimetable
optional

運行中の便の時刻表のID (odpt:BusTimetableのowl:sameAs)
Example : "string"

string (odpt:BusTimetable owl:sameAs)

odpt:operator
required

運行会社のID (odpt:Operatorのowl:sameAs)
Example : "string"

string (odpt:Operator owl:sameAs)

odpt:startingBusstopPole
optional

運行中系統の始発バス停を表すID (odpt:BusstopPoleのowl:sameAs)
Example : "string"

string (odpt:BusstopPole owl:sameAs)

odpt:terminalBusstopPole
optional

運行中系統の終着バス停を表すID (odpt:BusstopPoleのowl:sameAs)
Example : "string"

string (odpt:BusstopPole owl:sameAs)

odpt:fromBusstopPole
optional

直近に通過した、あるいは停車中のバス停のID (odpt:BusstopPoleのowl:sameAs)。 詳細はodpt:Busの説明の冒頭に記載
Example : "string"

string (odpt:BusstopPole owl:sameAs)

odpt:fromBusstopPoleTime
optional

直近に通過したバス停を発車した時刻。odpt:fromBusstopPoleがnullならばodpt:fromBusstopPoleTimeもnullとなる
Example : "2017-01-13T15:10:00+09:00"

string (xsd:dateTime)

odpt:toBusstopPole
optional

次に到着するバス停のID (odpt:BusstopPoleのowl:sameAs)。 詳細はodpt:Busの説明の冒頭に記載
Example : "string"

string (odpt:BusstopPole owl:sameAs)

odpt:progress
optional

Fromを0、toを1とした際の現在位置（割合）
Example : 0.0

number (double)

geo:long
optional

対象となるバスの経度 (10進表記、測地系はWGS84)
Example : 139.1234

number (double)

geo:lat
optional

対象となるバスの緯度 (10進表記、測地系はWGS84)
Example : 35.1234

number (double)

odpt:speed
optional

対象となるバスの速度(km/h)
Example : 0.0

number (double)

odpt:azimuth
optional

対象となるバスの進行方向方位角を示す。単位は度（°）。北が0度で、時計回り(東回り)に増加する。
Example : 90.0

number (double)

odpt:doorStatus
optional

対象となるバスの扉の開閉状態を示す。”open”は開いている、”close”は閉じている、”self”は半自動扱い
Example : "string"

enum (open, close, self)

odpt:occupancyStatus
optional

車両の混雑度
Example : "odpt.OccupancyStatus:Empty"

enum (odpt.OccupancyStatus:Empty, odpt.OccupancyStatus:ManySeatsAvailable, odpt.OccupancyStatus:FewSeatsAvailable, odpt.OccupancyStatus:StandingRoomOnly, odpt.OccupancyStatus:CrushedStandingRoomOnly, odpt.OccupancyStatus:FullRoomOnly, odpt.OccupancyStatus:NotAcceptingPassengers)

4.3.2. odpt:BusTimetable
バスの便の時刻表である。

Name	Description	Schema
@context
required

JSON-LD仕様に基づく @context のURL
Example : "http://vocab.odpt.org/context_odpt.jsonld"

string (URL)

@id
required

固有識別子(ucode)
Example : "urn:ucode:_00001C000000000000010000030FD7E5"

string (URN)

@type
required

バス時刻表のクラス名、"odpt:BusTimetable"が入る
Example : "odpt:BusTimetable"

string

owl:sameAs
required

バス時刻表の固有識別子
Example : "string"

string (URL)

dc:date
optional

データ生成時刻
Example : "2017-01-13T15:10:00+09:00"

string (xsd:dateTime)

dct:issued
optional

ダイヤ改正日
Example : "2017-01-13"

string (xsd:date)

dct:valid
optional

データ保証期限
Example : "2017-01-13T15:10:00+09:00"

string (xsd:dateTime)

dc:title
optional

バス路線名称（系統名等）
Example : "string"

string

odpt:kana
optional

バス路線名称のよみがな
Example : "string"

string

odpt:operator
required

運行会社のID (odpt:Operatorのowl:sameAs)
Example : "string"

string (odpt:Operator owl:sameAs)

odpt:busroutePattern
required

対応する運行系統のID (odpt:BusroutePatternのowl:sameAs)
Example : "string"

string (odpt:BusroutePattern owl:sameAs)

odpt:calendar
required

カレンダーのID (odpt:Calendarのowl:sameAs)
Example : "string"

string (odpt:Calendar owl:sameAs)

odpt:busTimetableObject
required

バス時刻表時分情報
Example : [ "object" ]

< odpt:busTimetableObject > array

odpt:busTimetableObject

Name	Description	Schema
odpt:index
required

標柱通過順
Example : 1

integer

odpt:busstopPole
required

バス停(標柱)のID (odpt:BusstopPoleのowl:sameAs)
Example : "string"

string (odpt:BusstopPole owl:sameAs)

odpt:arrivalTime
optional

バス到着時刻
Example : "10:00"

string (odpt:Time)

odpt:departureTime
optional

バス出発時刻
Example : "10:00"

string (odpt:Time)

odpt:destinationSign
optional

行先(方向幕)情報
Example : "string"

string

odpt:isNonStepBus
optional

ノンステップバスの場合 true
Example : true

boolean

odpt:isMidnight
optional

深夜バスの場合 true
Example : true

boolean

odpt:canGetOn
optional

乗車可能な場合 true
Example : true

boolean

odpt:canGetOff
optional

降車可能な場合 true
Example : true

boolean

odpt:note
optional

注記
Example : "string"

string

4.3.3. odpt:BusroutePattern
バス系統情報 odpt:BusroutePattern は、バス路線の系統情報を示す。 odpt:busstopPoleOrder が、運行するバスの停車する停留所(標柱)の順序を表現している。 バス路線（'王５７’等）は、通常、複数の系統情報から構成される。(e.g. 往路、復路、異なる停留所通過順のバリエーション)

Name	Description	Schema
@context
required

JSON-LD仕様に基づく @context のURL
Example : "http://vocab.odpt.org/context_odpt.jsonld"

string (URL)

@id
required

固有識別子 (ucode)
Example : "urn:ucode:_00001C000000000000010000030FD7E5"

string (URN)

@type
required

バス路線情報のクラス名、"odpt:BusroutePattern"が入る
Example : "odpt:BusroutePattern"

string

owl:sameAs
required

バス路線情報の固有識別子
Example : "string"

string (URL)

dc:date
required

データ生成時刻
Example : "2017-01-13T15:10:00+09:00"

string (xsd:dateTime)

dct:valid
optional

データの保証期限
Example : "2017-01-13T15:10:00+09:00"

string (xsd:dateTime)

dc:title
required

バス路線名称（系統名・系統番号等）
Example : "string"

string

odpt:kana
optional

バス路線名称のよみがな
Example : "string"

string

odpt:operator
required

運営会社を表すID (odpt:Operatorのowl:sameAs)
Example : "string"

string (odpt:Operator owl:sameAs)

odpt:busroute
optional

系統を表すID
Example : "string"

string

odpt:pattern
optional

系統パターン
Example : "string"

string

odpt:direction
optional

方向
Example : "string"

string

ug:region
optional

GeoJSON形式による地物情報
Example : "object"

object

odpt:busstopPoleOrder
required

停留所(標柱)の順序
Example : [ "object" ]

< odpt:busstopPoleOrder > array

odpt:note
optional

注記
Example : "string"

string

odpt:busLocationURL
optional

バス位置情報を示すWebSiteのURL
Example : "string"

string (URL)

odpt:busstopPoleOrder

Name	Description	Schema
odpt:busstopPole
required

停留所のID (odpt:BusstopPoleのowl:sameAs)
Example : "string"

string (odpt:BusstopPole owl:sameAs)

odpt:index
required

停留所通過順。通過順の昇順の値となる
Example : 1

integer

odpt:openingDoorsToGetOn
optional

乗車時に利用可能なドア
Example : [ "string" ]

< enum (odpt:OpeningDoor:FrontSide, odpt:OpeningDoor:RearSide) > array

odpt:openingDoorsToGetOff
optional

降車時に利用可能なドア
Example : [ "string" ]

< enum (odpt:OpeningDoor:FrontSide, odpt:OpeningDoor:RearSide) > array

odpt:note
optional

注記
Example : "string"

string

4.3.4. odpt:BusroutePatternFare
乗車バス停(標柱)、降車バス停(標柱)についての運賃情報

Name	Description	Schema
@context
required

JSON-LD仕様に基づく @context のURL
Example : "http://vocab.odpt.org/context_odpt.jsonld"

string (URL)

@id
required

固有識別子(ucode)
Example : "urn:ucode:_00001C000000000000010000030FD7E5"

string (URN)

@type
required

バス運賃のクラス名、"odpt:BusroutePatternFare"が入る
Example : "odpt:BusroutePatternFare"

string

owl:sameAs
required

バス運賃の固有識別子
Example : "string"

string (URL)

dc:date
required

データ生成時刻
Example : "2017-01-13T15:10:00+09:00"

string (xsd:dateTime)

dct:issued
optional

運賃改定日
Example : "2017-01-13"

string (xsd:date)

dct:valid
optional

データ保証期限
Example : "2017-01-13T15:10:00+09:00"

string (xsd:dateTime)

odpt:operator
required

運行会社を表すID (odpt:Operatorのowl:sameAs)
Example : "string"

string (odpt:Operator owl:sameAs)

odpt:fromBusroutePattern
required

乗車系統パターンを表すID (odpt:BusroutePatternのowl:sameAs)
Example : "string"

string (odpt:BusroutePattern owl:sameAs)

odpt:fromBusstopPoleOrder
required

乗車停留所の系統パターン内の停留所（標柱）通過順。odpt:fromBusroutePattern の示す odpt:BusroutePattern の、 odpt:busstopPoleOrder の odpt:index と同じ値。
Example : 0

integer

odpt:fromBusstopPole
required

乗車バス停を表すID。odpt:fromBusroutePattern, odpt:fromBusstopPoleOrder の示すバス停(標柱)のIDと同じ。
Example : "string"

string (odpt:BusstopPole owl:sameAs)

odpt:toBusroutePattern
required

降車系統パターンを表すID (odpt:BusroutePatternのowl:sameAs)
Example : "string"

string (odpt:BusroutePattern owl:sameAs)

odpt:toBusstopPoleOrder
required

降車停留所の系統パターン内の停留所（標柱）通過順。odpt:toBusroutePattern の示す odpt:BusroutePattern の、 odpt:busstopPoleOrder の odpt:index と同じ値。
Example : 0

integer

odpt:toBusstopPole
required

降車バス停を表すID (odpt:BusstopPoleのowl:sameAs)。 odpt:toBusroutePattern, odpt:toBusstopPoleOrder の示すバス停(標柱)のIDと同じ。
Example : "string"

string (odpt:BusstopPole owl:sameAs)

odpt:ticketFare
required

切符利用時の運賃（円）
Example : 200

integer

odpt:childTicketFare
optional

切符利用時の子供運賃（円）
Example : 100

integer

odpt:icCardFare
optional

ICカード利用時の運賃（円）
Example : 200

integer

odpt:childIcCardFare
optional

ICカード利用時の子供運賃（円）
Example : 100

integer

4.3.5. odpt:BusstopPole
バス停情報 odpt:BusstopPoleは、バス停(標柱)の情報を示す。

Name	Description	Schema
@context
required

JSON-LD仕様に基づく @context のURL
Example : "http://vocab.odpt.org/context_odpt.jsonld"

string (URL)

@id
required

固有識別子(ucode)
Example : "urn:ucode:_00001C000000000000010000030FD7E5"

string (URN)

@type
required

バス停(標柱)のクラス名、"odpt:BusstopPole"が入る
Example : "odpt:BusstopPole"

string

owl:sameAs
required

バス停(標柱)の固有識別子
Example : "string"

string (URL)

dc:date
required

データ生成時刻
Example : "2017-01-13T15:10:00+09:00"

string (xsd:dateTime)

dct:valid
optional

データの保証期限
Example : "2017-01-13T15:10:00+09:00"

string (xsd:dateTime)

dc:title
required

バス停名
Example : "豊洲駅前"

string

odpt:kana
optional

バス停名のよみがな
Example : "とよすえきまえ"

string

title
optional

バス停名（多言語対応）
Example : {"ja" : "豊洲駅前", "ja-Hrkt" : "とよすえきまえ", "en" : "Toyosu Sta."}

object

geo:long
optional

標柱の経度(WGS84)
Example : 139.1234

number (double)

geo:lat
optional

標柱の緯度(WGS84)
Example : 35.1234

number (double)

ug:region
optional

GeoJSON形式による地物情報
Example : "object"

object

odpt:busroutePattern
optional

入線する系統パターンのID (odpt:BusroutePatternのowl:sameAs) のリスト
Example : [ "string" ]

< string (odpt:BusroutePattern owl:sameAs) > array

odpt:operator
required

入線するバスの運営会社を表すID (odpt:Operatorのowl:sameAs) のリスト
Example : [ "string" ]

< string (odpt:Operator owl:sameAs) > array

odpt:busstopPoleNumber
optional

標柱番号。同一停留所の別標柱を区別するものであり、のりば番号とは一致する保証はない
Example : "string"

string

odpt:platformNumber
optional

のりば番号
Example : "string"

string

odpt:busstopPoleTimetable
optional

バス停(標柱)時刻表のID (odpt:BusstopPoleTimetableのowl:sameAs) のリスト
Example : [ "string" ]

< string (odpt:BusstopPoleTimetable owl:sameAs) > array

4.3.6. odpt:BusstopPoleTimetable
バス停(標柱)時刻表 odpt:busstopPole で示されたバス停(標柱)の時刻表。曜日区分や行先、路線等によって別個のデータになる場合がある。

Name	Description	Schema
@context
required

JSON-LD仕様に基づく @context のURL
Example : "http://vocab.odpt.org/context_odpt.jsonld"

string (URL)

@id
required

固有識別子(ucode)
Example : "urn:ucode:_00001C000000000000010000030FD7E5"

string (URN)

@type
required

バス停(標柱)時刻表のクラス名、"odpt:BusstopPoleTimetable"が入る
Example : "odpt:BusstopPoleTimetable"

string

owl:sameAs
required

バス停(標柱)時刻表の固有識別子
Example : "string"

string (URL)

dc:date
required

データ生成時刻
Example : "2017-01-13T15:10:00+09:00"

string (xsd:dateTime)

dct:issued
optional

ダイヤ改正日
Example : "2017-01-13"

string (xsd:date)

dct:valid
optional

データ保証期限。ISO8601形式。期限が存在する場合のみ格納する。
Example : "2017-01-13T15:10:00+09:00"

string (xsd:dateTime)

dc:title
optional

バス路線名称（系統名等）
Example : "string"

string

odpt:busstopPole
required

バス停(標柱)を表すID (odpt:BusstopPoleのowl:sameAs)
Example : "string"

string (odpt:BusstopPole owl:sameAs)

odpt:busDirection
required

方面を表すID。array となる場合もある。
Example : "string"

string

odpt:busroute
required

路線を表すID。array となる場合もある。(複数路線を含む時刻表の場合等)
Example : "string"

string

odpt:operator
required

運行会社を表すID (odpt:Operatorのowl:sameAs)
Example : "string"

string (odpt:Operator owl:sameAs)

odpt:calendar
required

運行する曜日・日付 (odpt:Calendarのowl:sameAs)
Example : "string"

string (odpt:Calendar owl:sameAs)

odpt:busstopPoleTimetableObject
optional

バス停(標柱)時刻表の時分情報
Example : [ "object" ]

< odpt:busstopPoleTimetableObject > array

odpt:busstopPoleTimetableObject

Name	Description	Schema
odpt:arrivalTime
optional

バス到着時刻
Example : "10:00"

string (odpt:Time)

odpt:departureTime
required

バス出発時刻
Example : "10:00"

string (odpt:Time)

odpt:destinationBusstopPole
optional

行先バス停(標柱)のID (odpt:BusstopPoleのowl:sameAs)
Example : "string"

string (odpt:BusstopPole owl:sameAs)

odpt:destinationSign
optional

行先(方向幕)情報
Example : "string"

string

odpt:busroutePattern
optional

バス路線のID (odpt:BusroutePatternのowl:sameAs)
Example : "string"

string (odpt:BusroutePattern owl:sameAs)

odpt:busroutePatternOrder
optional

系統パターン内の停留所（標柱）通過順。odpt:busroutePattern の示す odpt:BusroutePattern の odpt:busstopPoleOrder の odpt:index と同じ値。
Example : 0

integer

odpt:isNonStepBus
optional

ノンステップバスの場合 true
Example : true

boolean

odpt:isMidnight
optional

深夜バスの場合 true
Example : true

boolean

odpt:canGetOn
optional

乗車可能な場合 true
Example : true

boolean

odpt:canGetOff
optional

降車可能な場合 true
Example : true

boolean

odpt:note
optional

注記
Example : "string"

string

5. ODPT Airplane API
5.1. 概要
Airplane API では、航空機に関係した以下のデータを取得できる。

odpt:Airport

odpt:AirportTerminal

odpt:FlightInformationArrival

odpt:FlightInformationDeparture

odpt:FlightSchedule

odpt:FlightStatus

各データの内容については、それぞれの説明を参照すること。

5.1.1. バージョン情報
Version : 4.0.0

5.1.2. URIスキーム
Host : api.odpt.org
BasePath : /api/v4
Schemes : HTTPS

5.1.3. MIMEタイプ
application/json

5.2. パス
5.2.1. GET /api/v4/odpt:Airport
説明
空港の情報を取得する。

パラメータ
Type	Name	Description	Schema
Query

acl:consumerKey
required

開発者サイトにて提供されるアクセストークン

string (acl:ConsumerKey)

Query

@id
optional

データに付与された固有識別子

string (URN)

Query

owl:sameAs
optional

データに付与された固有識別子の別名

string (URL)

レスポンス
HTTP Code	Description	Schema
200

正常終了

< odpt:Airport > array

400

パラメータ不正

No Content

401

acl:consumerKeyが誤っている

No Content

403

権限なし

No Content

404

該当データ無し

No Content

500

サーバー内部エラー

No Content

503

サービス利用不可

No Content

Example HTTP request
Request path
/api/v4/odpt:Airport?acl:consumerKey=string
Example HTTP response
Response 200
[ {
				    "@context" : "http://vocab.odpt.org/context_odpt.jsonld",
				    "@id" : "urn:ucode:_00001C000000000000010000030FD7E5",
				    "@type" : "odpt:Airport",
				    "dc:date" : "2017-01-13T15:10:00+09:00",
				    "owl:sameAs" : "odpt.Airport:HND",
				    "dc:title" : "東京(羽田)",
				    "odpt:airportTitle" : {
				    "ja" : "東京(羽田)",
				    "en" : "Tokyo (Haneda)"
				    },
				    "odpt:airportTerminal" : [ "odpt.AirportTerminal:HND.DomesticTerminal1", "odpt.AirportTerminal:HND.DomesticTerminal2", "odpt.AirportTerminal:HND.InternationalTerminal" ]
} ]
5.2.2. GET /api/v4/odpt:AirportTerminal
説明
空港のターミナルの情報を取得する。

パラメータ
Type	Name	Description	Schema
Query

acl:consumerKey
required

開発者サイトにて提供されるアクセストークン

string (acl:ConsumerKey)

Query

@id
optional

データに付与された固有識別子

string (URN)

Query

owl:sameAs
optional

データに付与された固有識別子の別名

string (URL)

Query

odpt:airport
optional

空港を示すID (odpt:Airportのowl:sameAs)

string (odpt:Airport owl:sameAs)

レスポンス
HTTP Code	Description	Schema
200

正常終了

< odpt:AirportTerminal > array

400

パラメータ不正

No Content

401

acl:consumerKeyが誤っている

No Content

403

権限なし

No Content

404

該当データ無し

No Content

500

サーバー内部エラー

No Content

503

サービス利用不可

No Content

Example HTTP request
Request path
/api/v4/odpt:AirportTerminal?acl:consumerKey=string
Example HTTP response
Response 200
[ {
				    "@context" : "http://vocab.odpt.org/context_odpt.jsonld",
				    "@id" : "urn:ucode:_00001C000000000000010000030FD7E5",
				    "@type" : "odpt:AirportTerminal",
				    "dc:date" : "2017-01-13T15:10:00+09:00",
				    "owl:sameAs" : "odpt.AirportTerminal:HND.DomesticTerminal1",
				    "dc:title" : "国内線第１ターミナル",
				    "odpt:airportTerminalTitle" : {
				    "ja" : "国内線第１ターミナル",
				    "en" : "Domestic Terminal 1"
				    },
				    "odpt.airport" : "odpt.Airport:HND"
} ]
5.2.3. GET /api/v4/odpt:FlightInformationArrival
説明
フライト到着情報(空港に当日到着する航空機のリアルタイムな情報)を取得する。

パラメータ
Type	Name	Description	Schema
Query

acl:consumerKey
required

開発者サイトにて提供されるアクセストークン

string (acl:ConsumerKey)

Query

owl:sameAs
optional

データに付与された固有識別子の別名

string (URL)

Query

odpt:operator
optional

空港事業者または航空事業者を示すID (odpt:Operatorのowl:sameAs)

string (odpt:Operator owl:sameAs)

Query

odpt:airline
optional

エアラインの運行会社を示すID (odpt:Operatorのowl:sameAs)

string (odpt:Operator owl:sameAs)

Query

odpt:flightStatus
optional

フライト状況を示すID (odpt:FlightStatusのowl:sameAs)

string (odpt:FlightStatus owl:sameAs)

Query

odpt:arrivalAirport
optional

到着空港を示すID (odpt:Airportのowl:sameAs)

string (odpt:Airport owl:sameAs)

Query

odpt:arrivalAirportTerminal
optional

到着空港ターミナルを示すID (odpt:AirportTerminalのowl:sameAs)

string (odpt:AirportTerminal owl:sameAs)

Query

odpt:arrivalGate
optional

到着空港ゲート番号

string

Query

odpt:originAirport
optional

出発地の空港を示すID (odpt:Airportのowl:sameAs)

string (odpt:Airport owl:sameAs)

レスポンス
HTTP Code	Description	Schema
200

正常終了

< odpt:FlightInformationArrival > array

400

パラメータ不正

No Content

401

acl:consumerKeyが誤っている

No Content

403

権限なし

No Content

404

該当データ無し

No Content

500

サーバー内部エラー

No Content

503

サービス利用不可

No Content

Example HTTP request
Request path
/api/v4/odpt:FlightInformationArrival?acl:consumerKey=string
Example HTTP response
Response 200
[ {
				    "@context" : "http://vocab.odpt.org/context_odpt.jsonld",
				    "@id" : "urn:uuid:ff91feee-2d2c-4365-902e-26375fdf9d8b",
				    "@type" : "odpt:FlightInformationArrival",
				    "dc:date" : "2017-12-06T23:15:01+09:00",
				    "owl:sameAs" : "odpt.FlightInformationArrival:NAA.NRT.NH832",
				    "odpt:operator" : "odpt.Operator:NAA",
				    "odpt:airline" : "odpt.Operator:ANA",
				    "odpt:flightNumber" : [ "NH832" ],
				    "odpt:flightStatus" : "odpt.FlightStatus:Arrived",
				    "odpt:scheduledArrivalTime" : "06:45",
				    "odpt:actualArrivalTime" : "06:48",
				    "odpt:arrivalAirport" : "odpt.Airport:NRT",
				    "odpt:arrivalAirportTerminal" : "odpt.AirportTerminal:NRT.Terminal1",
				    "odpt:arrivalGate" : "27",
				    "odpt:baggageClaim" : "27",
				    "odpt:originAirport" : "odpt.Airport:SGN",
				    "odpt:aircraftType" : "788"
} ]
5.2.4. GET /api/v4/odpt:FlightInformationDeparture
説明
フライト出発情報(空港を当日出発する航空機のリアルタイムな情報)を取得する。

パラメータ
Type	Name	Description	Schema
Query

acl:consumerKey
required

開発者サイトにて提供されるアクセストークン

string (acl:ConsumerKey)

Query

owl:sameAs
optional

データに付与された固有識別子の別名

string (URL)

Query

odpt:operator
optional

空港事業者または航空事業者を示すID (odpt:Operatorのowl:sameAs)

string (odpt:Operator owl:sameAs)

Query

odpt:airline
optional

エアラインの運行会社を示すID (odpt:Operatorのowl:sameAs)

string (odpt:Operator owl:sameAs)

Query

odpt:flightStatus
optional

フライト状況を示すID (odpt:FlightStatusのowl:sameAs)

string (odpt:FlightStatus owl:sameAs)

Query

odpt:departureAirport
optional

出発空港を示すID (odpt:Airportのowl:sameAs)

string (odpt:Airport owl:sameAs)

Query

odpt:departureAirportTerminal
optional

出発空港ターミナルを示すID (odpt:AirportTerminalのowl:sameAs)

string (odpt:AirportTerminal owl:sameAs)

Query

odpt:departureGate
optional

出発空港ゲート番号

string

Query

odpt:destinationAirport
optional

目的地の空港を示すID (odpt:Airportのowl:sameAs)

string (odpt:Airport owl:sameAs)

レスポンス
HTTP Code	Description	Schema
200

正常終了

< odpt:FlightInformationDeparture > array

400

パラメータ不正

No Content

401

acl:consumerKeyが誤っている

No Content

403

権限なし

No Content

404

該当データ無し

No Content

500

サーバー内部エラー

No Content

503

サービス利用不可

No Content

Example HTTP request
Request path
/api/v4/odpt:FlightInformationDeparture?acl:consumerKey=string
Example HTTP response
Response 200
[ {
				    "@context" : "http://vocab.odpt.org/context_odpt.jsonld",
				    "@id" : "urn:uuid:f476346b-ae6d-4102-99d8-2bf80d7c4dd8",
				    "@type" : "odpt:FlightInformationDeparture",
				    "dc:date" : "2017-12-06T23:20:02+09:00",
				    "owl:sameAs" : "odpt.FlightInformationDeparture:NAA.NRT.9W4807",
				    "odpt:operator" : "odpt.Operator:NAA",
				    "odpt:airline" : "odpt.Operator:JAI",
				    "odpt:flightNumber" : [ "9W4807" ],
				    "odpt:flightStatus" : "odpt.FlightStatus:Takeoff",
				    "odpt:scheduledDepartureTime" : "08:30",
				    "odpt:actualDepartureTime" : "08:32",
				    "odpt:departureAirport" : "odpt.Airport:NRT",
				    "odpt:departureAirportTerminal" : "odpt.AirportTerminal:NRT.Terminal2",
				    "odpt:departureGate" : "85",
				    "odpt:checkInCounter" : [ "B", "C" ],
				    "odpt:destinationAirport" : "odpt.Airport:HKG",
				    "odpt:aircraftType" : "788"
} ]
5.2.5. GET /api/v4/odpt:FlightSchedule
説明
フライト時刻表(空港を発着する航空機の予定時刻表)を取得する。

パラメータ
Type	Name	Description	Schema
Query

acl:consumerKey
required

開発者サイトにて提供されるアクセストークン

string (acl:ConsumerKey)

Query

@id
optional

データに付与された固有識別子

string (URN)

Query

owl:sameAs
optional

データに付与された固有識別子の別名

string (URL)

Query

odpt:operator
optional

空港事業者または航空事業者を示すID (odpt:Operatorのowl:sameAs)

string (odpt:Operator owl:sameAs)

Query

odpt:calendar
optional

運行日を示すID (odpt:Calendarのowl:sameAs)

string (odpt:Calendar owl:sameAs)

Query

odpt:originAirport
optional

出発地の空港を示すID (odpt:Airportのowl:sameAs)

string (odpt:Airport owl:sameAs)

Query

odpt:destinationAirport
optional

目的地の空港を示すID (odpt:Airportのowl:sameAs)

string (odpt:Airport owl:sameAs)

レスポンス
HTTP Code	Description	Schema
200

正常終了

< odpt:FlightSchedule > array

400

パラメータ不正

No Content

401

acl:consumerKeyが誤っている

No Content

403

権限なし

No Content

404

該当データ無し

No Content

500

サーバー内部エラー

No Content

503

サービス利用不可

No Content

Example HTTP request
Request path
/api/v4/odpt:FlightSchedule?acl:consumerKey=string
Example HTTP response
Response 200
[ {
				    "@context" : "http://vocab.odpt.org/context_odpt.jsonld",
				    "@id" : "urn:ucode:_00001C000000000000010000030FD7E5",
				    "@type" : "odpt:FlightSchedule",
				    "dc:date" : "2017-10-31T23:06:38+09:00",
				    "owl:sameAs" : "odpt.FlightSchedule:HND-TIAT.HND.IWJ.Wednesday",
				    "odpt:operator" : "odpt.Operator:HND-TIAT",
				    "odpt:calendar" : "odpt.Calendar:Wednesday",
				    "odpt:originAirport" : "odpt.Airport:HND",
				    "odpt:destinationAirport" : "odpt.Airport:IWJ",
				    "odpt:flightScheduleObject" : [ {
				    "odpt:airline" : "odpt.Operator:ANA",
				    "odpt:flightNumber" : [ "NH575" ],
				    "odpt:originTime" : "10:35",
				    "odpt:destinationTime" : "12:15",
				    "odpt:isValidFrom" : "2017-10-01T00:00:00+09:00",
				    "odpt:isValidTo" : "2017-10-31T23:59:59+09:00"
				    } ]
} ]
5.2.6. GET /api/v4/odpt:FlightStatus
説明
フライト状況の定義を取得する。

パラメータ
Type	Name	Description	Schema
Query

acl:consumerKey
required

開発者サイトにて提供されるアクセストークン

string (acl:ConsumerKey)

Query

@id
optional

データに付与された固有識別子

string (URN)

Query

owl:sameAs
optional

データに付与された固有識別子の別名

string (URL)

レスポンス
HTTP Code	Description	Schema
200

正常終了

< odpt:FlightStatus > array

400

パラメータ不正

No Content

401

acl:consumerKeyが誤っている

No Content

403

権限なし

No Content

404

該当データ無し

No Content

500

サーバー内部エラー

No Content

503

サービス利用不可

No Content

Example HTTP request
Request path
/api/v4/odpt:FlightStatus?acl:consumerKey=string
Example HTTP response
Response 200
[ {
				    "@context" : "http://vocab.odpt.org/context_odpt.jsonld",
				    "@id" : "urn:ucode:_00001C000000000000010000030FD7E5",
				    "@type" : "odpt:FlightStatus",
				    "dc:date" : "2017-01-13T15:10:00+09:00",
				    "owl:sameAs" : "odpt.FlightStatus:CheckIn",
				    "dc:title" : "搭乗手続中",
				    "odpt:flightStatusTitle" : {
				    "ja" : "搭乗手続中",
				    "en" : "Check in"
				    }
} ]
5.3. 定義
5.3.1. odpt:Airport
空港の情報を表す

Name	Description	Schema
@context
required

JSON-LD仕様に基づく @context のURL
Example : "http://vocab.odpt.org/context_odpt.jsonld"

string (URL)

@id
required

固有識別子(ucode)
Example : "urn:ucode:_00001C000000000000010000030FD7E5"

string (URN)

@type
required

クラス名。odpt:Airport
Example : "odpt:Airport"

string

dc:date
optional

データ生成日時 (ISO8601 日付時刻形式)
Example : "2017-01-13T15:10:00+09:00"

string (xsd:dateTime)

owl:sameAs
required

固有識別子。命名ルールは、odpt.Airport:IATA空港コード(3レターコード) である。
Example : "odpt.Airport:HND"

string (URL)

dc:title
optional

空港名（日本語）。所在地や他の空港との区別が明確に分かるような名称とする。
Example : "東京(羽田)"

string

odpt:airportTitle
optional

空港名（多言語対応）
Example : {"ja" : "東京(羽田)", "en" : "Tokyo (Haneda)"}

object

odpt:airportTerminal
optional

空港のターミナルを表す ID (odpt:AirportTerminalのowl:sameAs) のリスト
Example : [ "odpt.AirportTerminal:HND.DomesticTerminal1" ]

< string (odpt:AirportTerminal owl:sameAs) > array

geo:long
optional

代表点の経度、10進表記、測地系はWGS84
Example : 139.1234

number

geo:lat
optional

代表点の緯度、10進表記、測地系はWGS84
Example : 35.1234

number

ug:region
optional

GeoJSON形式による地物情報
Example : "object"

object

5.3.2. odpt:AirportTerminal
空港のターミナルの情報を表す

Name	Description	Schema
@context
required

JSON-LD仕様に基づく @context のURL
Example : "http://vocab.odpt.org/context_odpt.jsonld"

string (URL)

@id
required

固有識別子(ucode)
Example : "urn:ucode:_00001C000000000000010000030FD7E5"

string (URN)

@type
required

クラス名。odpt:AirportTerminal
Example : "odpt:AirportTerminal"

string

dc:date
optional

データ生成日時 (ISO8601 日付時刻形式)
Example : "2017-01-13T15:10:00+09:00"

string (xsd:dateTime)

owl:sameAs
required

固有識別子。命名ルールは、odpt.AirportTerminal.IATA空港コード(3レターコード).ターミナル である。同一ターミナル内のウィング等を表記する場合は、末尾に .ウィング 等をつける。
Example : "odpt.AirportTerminal:HND.DomesticTerminal1"

string (URL)

dc:title
optional

空港ターミナル名（日本語）
Example : "国内線第１ターミナル"

string

odpt:airportTerminalTitle
optional

空港ターミナル名（多言語対応）
Example : {"ja" : "国内線第１ターミナル", "en" : "Domestic Terminal 1"}

object

odpt:airport
required

空港を示すID (odpt:Airportのowl:sameAs)
Example : "odpt.Airport:HND"

string (odpt:Airport owl:sameAs)

geo:long
optional

代表点の経度、10進表記、測地系はWGS84
Example : 139.1234

number

geo:lat
optional

代表点の緯度、10進表記、測地系はWGS84
Example : 35.1234

number

ug:region
optional

GeoJSON形式による地物情報
Example : "object"

object

5.3.3. odpt:FlightInformationArrival
フライト到着情報は、空港に当日到着する航空機のリアルタイムな情報を表す

Name	Description	Schema
@context
required

JSON-LD仕様に基づく @context のURL
Example : "http://vocab.odpt.org/context_odpt.jsonld"

string (URL)

@id
required

固有識別子(ucode又はuuid)
Example : "urn:uuid:ff91feee-2d2c-4365-902e-26375fdf9d8b"

string (URN)

@type
required

クラス指定。odpt:FlightInformationArrival
Example : "odpt:FlightInformationArrival"

string

dc:date
required

データ生成日時 (ISO8601 日付時刻形式)
Example : "2017-12-07T13:10:00+09:00"

string (xsd:dateTime)

dct:valid
optional

データ保証期限（ISO8601 日付時刻形式）
Example : "2017-12-07T13:15:00+09:00"

string (xsd:dateTime)

owl:sameAs
required

固有識別子。 命名ルールは、odpt.FightInformationArrival:空港事業者または航空事業者.到着空港.フライト番号 である。前記の命名ルールで重複が生じる場合は、末尾に .1, .2, .3, … をつけて区別する。
Example : "odpt.FlightInformationArrival:HND-TIAT.HND.JL172"

string (URL)

odpt:operator
required

フライト到着情報を提供する空港事業者または航空事業者を示すID (odpt:Operatorのowl:sameAs)
Example : "odpt.Operator:HND-TIAT"

string (odpt:Operator owl:sameAs)

odpt:airline
optional

エアラインの運行会社を表すID (odpt:Operatorのowl:sameAs)
Example : "odpt.Operator:ANA"

string (odpt:Operator owl:sameAs)

odpt:flightNumber
required

フライト番号のリスト。共同運航便では複数となる。
Example : [ "NH105", "UA7983" ]

< string > array

odpt:flightStatus
optional

フライト状況を表すID (odpt:FlightStatusのowl:sameAs)
Example : "odpt.FlightStatus:Arrived"

string (odpt:FlightStatus owl:sameAs)

odpt:flightInformationSummary
optional

運行障害発生時など、特記すべき情報がある場合に記載する、自然言語による情報の要約（多言語対応）
Example : {"ja" : "引き返し", "en" : "Turn back"}

object

odpt:flightInformationText
optional

運行障害発生時など、特記すべき情報がある場合に記載する、自然言語による情報の記述（多言語対応）
Example : {"ja" : "急病人救護のため引き返します", "en" : "Turn back for medical care"}

object

odpt:scheduledArrivalTime
optional

定刻の到着時刻(ISO8601の時刻形式)。
Example : "06:05"

string (odpt:Time)

odpt:estimatedArrivalTime
optional

変更後到着時刻(ISO8601の時刻形式)、到着以降はodpt:actualArrivalTimeが生成され、odpt:estimatedArrivalTimeは取得できなくなる。
Example : "06:04"

string (odpt:Time)

odpt:actualArrivalTime
optional

実際の到着時刻(ISO8601の時刻形式)、到着するまでは存在しない。
Example : "06:06"

string (odpt:Time)

odpt:arrivalAirport
required

到着空港を示すID (odpt:Airportのowl:sameAs)
Example : "odpt.Airport:NRT"

string (odpt:Airport owl:sameAs)

odpt:arrivalAirportTerminal
optional

到着空港のターミナルを表すID (odpt:AirportTerminalのowl:sameAs)
Example : "odpt.AirportTerminal:NRT.Terminal2"

string (odpt:AirportTerminal owl:sameAs)

odpt:arrivalGate
optional

到着空港のゲート番号
Example : "12A"

string

odpt:baggageClaim
optional

到着空港の預け手荷物受取所
Example : "12A"

string

odpt:originAirport
optional

出発地の空港を示すID (odpt:Airportのowl:sameAs)
Example : "odpt.Airport:HKG"

string (odpt:Airport owl:sameAs)

odpt:viaAirport
optional

経由地の空港を表すID (odpt:Airportのowl:sameAs)のリスト
Example : [ "odpt.Airport:NRT" ]

< string (odpt:Airport owl:sameAs) > array

odpt:aircraftType
optional

航空機の機種
Example : "788"

string

5.3.4. odpt:FlightInformationDeparture
フライト出発情報は、空港から当日出発する航空機のリアルタイムな情報を表す

Name	Description	Schema
@context
required

JSON-LD仕様に基づく @context のURL
Example : "http://vocab.odpt.org/context_odpt.jsonld"

string (URL)

@id
required

固有識別子(ucode又はuuid)
Example : "urn:uuid:ff91feee-2d2c-4365-902e-26375fdf9d8b"

string (URN)

@type
required

クラス指定。odpt:FlightInformationDeparture
Example : "odpt:FlightInformationDeparture"

string

dc:date
required

データ生成日時 (ISO8601 日付時刻形式)
Example : "2017-12-07T13:10:00+09:00"

string (xsd:dateTime)

dct:valid
optional

データ保証期限（ISO8601 日付時刻形式）
Example : "2017-12-07T13:15:00+09:00"

string (xsd:dateTime)

owl:sameAs
required

固有識別子。 命名ルールは、odpt.FightInformationDeparture:空港事業者または航空事業者.出発空港.フライト番号 である。前記の命名ルールで重複が生じる場合は、末尾に .1, .2, .3, … をつけて区別する。
Example : "odpt.FlightInformationDeparture:HND-TIAT.HND.JL172"

string (URL)

odpt:operator
required

フライト出発情報を提供する空港事業者または航空事業者を示すID (odpt:Operatorのowl:sameAs)
Example : "odpt.Operator:HND-TIAT"

string (odpt:Operator owl:sameAs)

odpt:airline
optional

エアラインの運行会社を表すID (odpt:Operatorのowl:sameAs)
Example : "odpt.Operator:ANA"

string (odpt:Operator owl:sameAs)

odpt:flightNumber
required

フライト番号のリスト。共同運航便では複数となる。
Example : [ "NH105", "UA7983" ]

< string > array

odpt:flightStatus
optional

フライト状況を表すID (odpt:FlightStatusのowl:sameAs)
Example : "odpt.FlightStatus:Takeoff"

string (odpt:FlightStatus owl:sameAs)

odpt:flightInformationSummary
optional

特記すべき情報がある場合に記載する、自然言語による情報の要約（多言語対応）
Example : {"ja" : "引き返し", "en" : "Turn back"}

object

odpt:flightInformationText
optional

特記すべき情報がある場合に記載する、自然言語による情報の記述（多言語対応）
Example : {"ja" : "急病人救護のため引き返します", "en" : "Turn back for medical care"}

object

odpt:scheduledDepartureTime
optional

定刻の出発時刻(ISO8601の時刻形式)
Example : "06:05"

string (odpt:Time)

odpt:estimatedDepartureTime
optional

変更後出発時刻(ISO8601の時刻形式)、出発以降はodpt:actualDepartureTimeが生成され、odpt:estimatedDepartureTimeは取得できなくなる。
Example : "06:04"

string (odpt:Time)

odpt:actualDepartureTime
optional

実際の出発時刻(ISO8601の時刻形式)、出発するまでは存在しない。
Example : "06:06"

string (odpt:Time)

odpt:departureAirport
required

出発空港を示すID (odpt:Airportのowl:sameAs)
Example : "odpt.Airport:NRT"

string (odpt:Airport owl:sameAs)

odpt:departureAirportTerminal
optional

出発空港のターミナルを示すID (odpt:AirportTerminalのowl:sameAs)
Example : "odpt.AirportTerminal:NRT.Terminal2"

string (odpt:AirportTerminal owl:sameAs)

odpt:departureGate
optional

出発空港のゲート番号
Example : "12A"

string (xst:string)

odpt:checkInCounter
optional

出発空港のチェックインカウンターのリスト
Example : [ "A", "B" ]

< string > array

odpt:destinationAirport
optional

目的地の空港を示すID (odpt:Airportのowl:sameAs)
Example : "odpt.Airport:HKG"

string (odpt:Airport owl:sameAs)

odpt:viaAirport
optional

経由地の空港を表すID (odpt:Airportのowl:sameAs)のリスト
Example : [ "odpt.Airport:NRT" ]

< string (odpt:Airport owl:sameAs) > array

odpt:aircraftType
optional

航空機の機種
Example : "788"

string

5.3.5. odpt:FlightSchedule
フライト時刻表は、空港を発着する航空機の予定時刻表を表す

Name	Description	Schema
@context
required

JSON-LD仕様に基づく @context のURL
Example : "http://vocab.odpt.org/context_odpt.jsonld"

string (URL)

@id
required

固有識別子(ucode)
Example : "urn:ucode:_00001C000000000000010000030FD7E5"

string (URN)

@type
required

クラス指定、odpt:FlightSchedule固定
Example : "odpt:FlightSchedule"

string

dc:date
optional

データ生成日時 (ISO8601 日付時刻形式)
Example : "2017-12-07T13:10:00+09:00"

string (xsd:dateTime)

owl:sameAs
required

固有識別子。命名ルールは、odpt.FlightSchedule:空港事業者または航空事業者.出発地の空港.目的地の空港.カレンダー情報 である。
Example : "odpt.FlightSchedule:ANA.HND.ITM.Wednesday"

string (URL)

odpt:operator
required

フライト時刻表を提供する空港事業者または航空事業者を示すID (odpt:Operatorのowl:sameAs)
Example : "odpt.Operator:ANA"

string (odpt:Operator owl:sameAs)

odpt:calendar
required

フライト時刻表に対応するカレンダー情報を示すID (odpt:Calendarのowl:sameAs)
Example : "odpt.Calendar:Wednesday"

string (odpt:Calendar owl:sameAs)

odpt:originAirport
required

出発地の空港のID (odpt:Airportのowl:sameAs)
Example : "odpt.Airport:HND"

string (odpt:Airport owl:sameAs)

odpt:destinationAirport
required

目的地の空港のID (odpt:Airportのowl:sameAs)
Example : "odpt.Airport:ITM"

string (odpt:Airport owl:sameAs)

odpt:flightScheduleObject
optional

時刻表オブジェクト
Example : [ "object" ]

< odpt:FlightScheduleObject > array

odpt:FlightScheduleObject

Name	Description	Schema
odpt:airline
required

エアラインの運行会社のID
Example : "odpt.Operator:ANA"

string (odpt:Operator owl:sameAs)

odpt:flightNumber
required

フライト番号のリスト。共同運航便では複数となる。
Example : [ "NH105", "UA7983" ]

< string > array

odpt:originTime
required

出発地の空港からの出発予定時刻 (ISO8601時刻形式、現地時間)
Example : "10:00"

string (odpt:Time)

odpt:originDayDifference
optional

出発日とカレンダー情報(odpt:FlightScheduleのodpt:calendar)の日数差。例: 0は当日発、1は翌日発、-1は前日発
Example : 0

integer

odpt:destinationTime
required

目的地の空港への到着予定時刻 (ISO8601時刻形式、現地時間)
Example : "12:15"

string (odpt:Time)

odpt:destinationDayDifference
optional

到着日とカレンダー情報(odpt:FlightScheduleのodpt:calendar)の日数差。例: 0は当日着、1は翌日着、-1は前日着
Example : 1

integer

odpt:viaAirport
optional

経由地の空港を表すID (odpt:Airportのowl:sameAs)のリスト
Example : [ "odpt.Airport:NRT" ]

< string (odpt:Airport owl:sameAs) > array

odpt:aircraftType
optional

航空機の機種
Example : "788"

string

odpt:isValidFrom
optional

データ適用開始日時 (ISO8601日付時刻形式)
Example : "2017-10-31T23:06:38+09:00"

string (xsd:dateTime)

odpt:isValidTo
optional

データ適用終了日時 (ISO8601日付時刻形式)
Example : "2017-10-31T23:06:38+09:00"

string (xsd:dateTime)

odpt:note
optional

その他プロパティとして定義されていない注釈情報の自然言語による記載（多言語対応）
Example : {"ja" : "日本語での注釈情報", "en" : "Note in English"}

object

5.3.6. odpt:FlightStatus
搭乗中、出発済みなど、空港を発着する航空機の状況を定義する

Name	Description	Schema
@context
required

JSON-LD仕様に基づく @context のURL
Example : "http://vocab.odpt.org/context_odpt.jsonld"

string (URL)

@id
required

固有識別子(ucode)
Example : "urn:ucode:_00001C000000000000010000030FD7E5"

string (URN)

@type
required

クラス名。odpt:FlightStatus
Example : "odpt:FlightStatus"

string

dc:date
optional

データ生成日時 (ISO8601 日付時刻形式)
Example : "2017-01-13T15:10:00+09:00"

string (xsd:dateTime)

owl:sameAs
required

固有識別子。命名ルールは、odpt.FlightStatus:フライト状況 である。
Example : "odpt.FlightStatus:CheckIn"

string (URL)

dc:title
optional

フライト状況（日本語）
Example : "搭乗手続中"

string

odpt:flightStatusTitle
optional

フライト状況（多言語対応）
Example : {"ja" : "搭乗手続中", "en" : "Check in"}

object

6. ODPT File API
6.1. 概要
配布されるファイルを取得するためのAPI

6.1.1. バージョン情報
Version : 1.0

6.1.2. URIスキーム
Host : api.odpt.org
BasePath : /v4/files
Schemes : HTTPS

6.2. パス
6.2.1. GET /v4/files/
説明
各社提供ファイル取得用API

パラメータ
Type	Name	Description	Schema
Query

acl:consumerKey
optional

subscription key in url

string

Query

path
required

path to resource

enum (Dictionary.yaml)

Example HTTP request
Request path
/v4/files/?path=string
7. 付録::RDF及びJSON-LDについて
本項では、公共交通オープンデータで使われている技術を解説し、応用に関するTipsを紹介する。

7.1. URI (Uniform Resource Identifier)
URI (Uniform Resource Identifier)は、インターネット上のリソースを一意に特定するための文字列であり、URL (Uniform Resource Locator)とURN (Uniform Resource Name)に分類できる。

URLは、スキーム名（HTTP、FTPなど）、ホスト名、パス名などを適切な順序で組み合わせることでインターネット上にあるリソースを一意に特定する。ホスト名やパスを指定してリソースを特定することから、リソースのインターネット上の住所にたとえられる。ウェブサイトを閲覧する際に利用されていることでなじみ深いだろう。

URNは、スキーム名、名前空間識別子、名前空間固有文字列を組み合わせてインターネット上のリソースを一意に特定する。識別子を利用してリソースを特定することから、リソースのインターネット上の名前にたとえられる。URNとして、uID Centerの発行するucode (Ubiquitous Code)や書籍に付与されるISBN (International Standard Book Number)などが利用されている。

なお、従来URIで利用できる文字はASCII文字のみに制限されていたが、現在は日本語など多国語を扱えるようにURIを拡張したIRI (Internationalized Resource Identifier)が広く利用されている。本ドキュメント内での解説において利用しているURIという用語は、そのままIRIと置き換えてもかまわないが、わかりやすさ、なじみ深さの観点からURIという用語を利用して解説している。

7.2. RDF (Resource Description Framework)
RDF (Resource Description Framework) は、ウェブ上のデータをやりとりするためにW3C によって標準化された規格である。従来ウェブ上に掲載されている情報は、人間が読んで内容を理解できるように記述されていたが、RDF はコンピュータがインターネット上のリソースの内容を解釈できること（機械可読）を目指して策定された。RDF はインターネット上のリソースだけではなく、実世界のモノや概念や文字列なども扱えるような仕様となっている。

RDF は、説明の対象を表す主語（Subject）、主語の属性を表す述語（Predicate）、属性の値を表す目的語（Object）の三つ組（トリプル）で一つのRDF 文を構成する。RDF文を複数連結したものをRDFグラフと呼び、主語を表すノードと目的語を表すノードを述語を表す矢印で結んだ有向グラフとして表現される(図1)。主語にはURIかブランクノード（空を表現するノード）が、述語にはURIが、目的語にはURIやリテラル（文字列や数字など）やブランクノードが格納される。述語に格納されるURIは主語の属性を表していることから一般的にプロパティと呼ばれ、URIとリテラルを総称してリソースと呼ぶ。RDFの実際の応用例として、RSS (RDF Site Summary)やFacebook等のSNS (Social Networking Service)でリンク先の概要を表示するために採用されているOGP (Open Graph Protocol)などが挙げられ、徐々に利用シーンが増えている。

図1 RDFの基本単位、トリプル

図2は、 http://example.com/Stations/Tokyo で表現されるリソースのタイトル(http://purl.org/dc/elements/1.1/title )が「東京」を表すRDF文と、 http://example.com/Stations/Tokyo で表現されるリソースの路線(http://example.com/railway )が http://example.com/Railway/Marunouchi であり、さらにそのタイトルが「丸ノ内」であることを表すRDF文を組み合わせたRDFグラフである。図中の丸がURIを表し、四角がリテラルを表し、矢印がプロパティを表す。

図2 RDFで東京駅を記述した例

7.3. RDF Schema
RDF はリソースとリソースの関係性を記述するが、関係性を表すプロパティも同様に、RDF Schemaと呼ばれるボキャブラリを用いてプロパティの用法や意味を記述する。RDF Schemaには、オブジェクト指向プログラミング言語のように、クラスという概念が存在する。クラスはリソースの種類を表し、あるクラスに属するリソースを、あるクラスのインスタンスであるという。たとえば鉄道駅クラスのインスタンスには、東京駅や新宿駅が存在する。RDF Schema では、プロパティの主語となり得るクラスとプロパティの目的語となり得るクラスを、プロパティの意味と共にRDF グラフで表現するための語彙（ボキャブラリ）を定義している。

7.4. ボキャブラリ
ボキャブラリとは、RDF グラフを記述するために利用可能なクラスやプロパティ等の集まりであり、RDF Schema 等を利用して記述されている。ボキャブラリには、RDFのスキーマを定義するために設計されたRDF Schema や、リソースのメタデータを記述するために設計されたDublin coreや、人に関する情報を記述するために設計されたFOAF(Friend of a Friend)などが存在する。

ボキャブラリの定義には、同じURI から始まるRDF 文が含まれ、たとえばRDF Schemaのボキャブラリには、クラスを表す http://www.w3.org/2000/01/rdf-schema#ClassName や説明文を表す http://www.w3.org/2000/01/rdf-schema#comment など、 http://www.w3.org/2000/01/rdf-schema# から始まる主語に関するるRDFグラフが記述されている。このURIの共通部分を名前空間と呼び、 ボキャブラリを利用する場合には、この名前空間の省略形であるプレフィックスを利用する。プレフィックスと、プレフィックス以降のURI はコロンで結合して記述し、たとえば、RDF Schema http://www.w3.org/2000/01/rdf-schema# は、rdfs という省略形を利用する。先述のクラスと説明文を表すリソースはそれぞれ、rdfs:ClassName、rdfs:commentと、非常にすっきりした形式で表現できる。

7.5. RDFの記述方法
ボキャブラリの定義やデータの記述には、XML 形式を利用する RDF/XML 形式や、RDF 記述のために軽量化したフォーマットであるTurtle形式、JSON 形式を利用する JSON-LD 形式が一般的に利用される。例として、クラスを表すクラスである rdfs:ClassName と、リソースを表すクラスであるrdfs:Resource と、プロパティが主語に取り得るクラスを表す rdfs:domain と、ボキャブラリの説明 rdfs:comment の定義を、RDFS定義ファイルから一部抜粋して生成した表（表1、表2）と、RDFグラフ（図3）を、それぞれ掲載する。

表1:クラスの定義

URI	クラス名(rdfs:label)	説明(rdfs:comment)
rdfs:ClassName

ClassName

The className of classNamees.

rdfs:Resource

Resource

The className resource, everything.

表2:プロパティの定義

URI	プロパティ名(rdfs:label)	説明(rdfs:comment)	主語のクラス(rdfs:domain)	述語のクラス(rdfs:range)
rdfs:domain

domain

A domain of the subject property.

rdf:Property

rdfs:ClassName

rdfs:comment

comment

A description of the subject resource.

rdfs:Resource

rdfs:Literal

図3 RDF Schemaの一部を図示

7.6. Linked Data
Linked Data は、RDF を活用して記述したデータとすでに RDF 等で記述され公開されている他のデータとの関連性を一定の方式で記述することで、世界中の様々なリソースをリンクし、人やコンピュータが新たなデータを発見しやすくしようとする考え方である。記述する関係性として、主語と目的語が同一であることを表す owl:sameAs や、主語と目的語が関連していることを表す skos:related などが利用されている。様々な団体や個人が LinkedData を公開しているが、最も数多く公開しているのは、Wikipedia をLinked Data 化したDB Pediaである。既に世界中で様々なLinked Dataが公開されており、データ数を丸の大きさで、リンク数を線の太さで表現された図4が有名である。(Linking Open Data cloud diagram, by Richard Cyganiak and Anja Jentzsch.)

図4 Linked Dataの公開元とデータ同士のリンクの様子

7.7. JSON-LD
JSON-LD (JSON for Linked Data)は、Webアプリケーション開発に広く採用されているJSON形式を用いてLinked Dataを記述するために策定されたフォーマットであり、2014年1月16日にW3C勧告となったため、今後幅広く利用されていくと思われる。主な特徴は、下記の通り。

通常のJSONと互換性がある

通常のJSON のパーザを利用して値を取得できるようになっているため、目的に応じてただの　JSON　データとしても、Linked Data としても扱うことができる。このため、Linked Data として扱う必要のない場合でも扱いやすいデータとなっている。本 API を利用して作成されるアプリケーションの多くは RDF としてデータを解釈する必要がないと思われるため、通常の JSON データとして扱えることは便利であると思われる。

主語に対するプロパティをまとめて一つのJSONオブジェクトとして記述できる

JSON オブジェクト内で @id という名前のキーで主語が定義され、その主語に対するプロパティを同じオブジェクト内にまとめて記述することができるため、可読性の向上と記述量の削減を図れる。

プレフィックスを定義できる

@@context という名前のキーが定義されていて、この中に名前空間のプレフィックスとURI を記述することで、プレフィックスを用いた省略記法を利用でき、可読性の向上と記述量の削減を図れる。

RDF文の入れ子を記述できる

RDF 文は、図2 で示したような入れ子型のグラフとなる場合もあるが、JSON-LD では通常のJSON でオブジェクトを入れ子にできるのと同様に記述できる。

記述のサンプルとして、表1、表2に記述したボキャブラリの定義を、JSON-LD形式で表現した例を示す。 なお本ドキュメントでは、JSON-LD の仕様は説明しないため、詳細な仕様についてはW3CによるJSON-LDの仕様を参照されたい。また、各プログラミング言語で JSON-LD を RDF として扱うためのライブラリもJSON-LD のサイトのオフィシャルサイトで紹介されているので、合わせて参照されたい。

{
			    "@context": {
			    "rdfs":"http://www.w3.org/2000/01/rdf-schema#"
			    },
			    "@id": "http://www.w3.org/2000/01/rdf-schema#",
			    "@graph": [
			    {
			    "@id": "rdfs:Resource",
			    "@type": "rdfs:ClassName",
			    "rdfs:label": "Resource",
			    "rdfs:comment": "The className resource, everything."
			    },
			    {
			    "@id": "rdfs:ClassName",
			    "@type": "rdfs:ClassName",
			    "rdfs:label": "ClassName",
			    "rdfs:comment": "The className of classNamees."
			    },
			    {
			    "@id": "rdfs:comment",
			    "@type": "rdfs:Property",
			    "rdfs:label": "comment",
			    "rdfs:comment": "A description of the subject resource.",
			    "rdfs:domain": "rdfs:Resource",
			    "rdfs:range": "rdfs:Literal"
			    },
			    {
			    "@id": "rdfs:domain",
			    "@type": "rdfs:Property",
			    "rdfs:label": "domain",
			    "rdfs:comment": "A domain of the subject property.",
			    "rdfs:domain": "rdfs:ClassName",
			    "rdfs:range": "rdf:Property"
			    }
			    ]
}
8. 更新履歴
2025-11-28

データセットによっては、エンドポイントが https://api.odpt.org/api/v4/ 以外で始まる場合もあることを、留意点に追加しました。

2024-03-25

odpt:Station (駅情報) に、odpt:connectingStation (乗り換え可能駅) を追加しました。

2023-11-09

odpt:BusstopPole (バス停情報) に、odpt:platformNumber (のりば番号) を追加しました。

2022-09-20

odpt:BusroutePattern (バス系統情報)の odpt:operator (運営会社を表すID)のデータ型を、リスト(配列)から文字列に修正しました。

2021-08-23

odpt:Calendar (曜日・日付区分) で、同じ日付が複数の特定クラスに該当する場合の説明を追加しました。

odpt:BusstopPoleTimetable (バス停(標柱)時刻表) に、odpt:busroutePatternOrder (系統パターン内の停留所(標柱)通過順) を追加しました。

その他、誤植などを修正しました。

2021-03-04

odpt:Bus (バス運行情報) に、odpt:occupancyStatus (車両の混雑度) を追加しました。

2021-02-03

odpt:Bus (バス運行情報) に、odpt:busTimetable (運行中の便の時刻表の ID) を追加しました。

2020-06-02

データ取得API (GET /v4/datapoints/$DATA_URI) に対応するデータ種別について、説明を追加しました。

2019-08-08

odpt:Train (列車情報) などで使用する列車番号は、ODPTで独自に採番する場合も含むため、説明を修正しました。

odpt:Train (列車情報) は、列車の在線(位置)を表しますが、駅に停車中か通過中かといった区別はされないため、説明を修正しました。

odpt:Bus (バス運行情報) で、バス停に停車中・接近中の判別がつかない場合について、説明を追加しました。

odpt:BusstopPole (バス停情報) で、title (多言語対応のバス停名) を追加しました。(dc:title は従来通り日本語のみとし、別プロパティの title で多言語対応しました)

その他、仕様書の書式を整えました。

2019-06-07

誤植を修正しました。

データダンプAPI (/v4/RDF_TYPE.json?) のレスポンス例を修正しました。

odpt:BusroutePattern (バス運行系統), odpt:BusstopPole (バス停) の ug:region (地物情報) を、GeoJSON オブジェクトに修正しました。

2019-04-25

データ検索APIのフィルタリングに、オブジェクト型のキーを指定できるようにしました。また、配列型の扱いについて記載しました。

緯度と経度の基準となる測地系は、WGS84(世界測地系)であることを明記しました。

odpt:Calendar (曜日・日付) がある日付において複数該当する場合の、優先度の説明を修正しました。

odpt:TrainTimetable (列車時刻表), odpt:StationTimetable (駅時刻表), odpt:RailwayFare (鉄道運賃), odpt:BusTimetable (バス時刻表), odpt:BusstopPoleTimetable (バス停(標柱)時刻表), odpt:BusroutePatternFare (バス運賃) に、dct:issued (ダイヤ改正日、運賃改定日) を追加しました。

odpt:TrainTimetable (列車時刻表), odpt:StationTimetable (駅時刻表), odpt:RailwayFare (鉄道運賃), odpt:FlightInformationArrival (フライト到着情報), odpt:FlightInformationDeparture (フライト出発情報) に、dct:valid (データ保証期限) を追加しました。

odpt:Railway (鉄道路線) に、odpt:ascendingRailDirection, odpt:descendingRailDirection (昇順・降順の進行方向) を追加しました。

odpt:Railway (鉄道路線) の odpt:StationOrder (駅順) に、環状線などの扱いの説明を追加しました。

odpt:PassengerSurvey (鉄道駅乗降人員数) に、odpt:includeAlighting (乗降人員と乗車人員の区別) を追加しました。

odpt:TrainInformation (列車運行情報) の適用される方向を、odpt:trainInformationLine から odpt:railDirection に変更しました。

odpt:Bus (バス運行情報) の位置に関する説明を追加しました。

odpt:FlightScheculeObject (フライト時刻表のオブジェクト) に、odpt:originDayDifference (出発日の差), odpt:destinationDayDifference (到着日の差), odpt:note (注釈情報) を追加しました。

2018-09-13

odpt:RailwayFare (鉄道運賃) に odpt:viaRailway (経由路線) と odpt:viaStation (経由駅) を追加しました。経由によって運賃が変わる場合、どの経由の運賃かを表すために使用します。

odpt:Airport (空港情報), odpt:AirportTerminal (空港ターミナル情報), odpt:FlightStatus (フライト状況) を追加しました。

odpt:FlightInformationArrival (フライト到着情報), odpt:FlightInformationDeparture (フライト出発情報), odpt:FlightSchedule (フライト時刻表) で、プロパティなどの変更を行いました。旧仕様に準拠したプログラムは修正が必要です。変更点の概要は次の通りです。

odpt:FlightInformationArrival

プロパティ名の変更: odpt:scheduledTime → odpt:scheduledArrivalTime, odpt:estimatedTime → odpt:estimatedArrivalTime, odpt:actualTime → odpt:actualArrivalTime, odpt:destinationAirport → odpt:arrivalAirport, odpt:departureAirport → odpt:originAirport, odpt:terminal → odpt:arrivalAirportTerminal

値の変更: owl:sameAs, odpt:airline (odpt:Airline→odpt:Operator), odpt:baggageClaim

プロパティ名の変更と値の変更: odpt:gate → odpt:arrivalGate

プロパティの追加: odpt:flightInformationSummary, odpt:flightInformationText, odpt:viaAirport, odpt:aircraftType

odpt:FlightInformationDeparture

プロパティ名の変更: odpt:scheduledTime → odpt:scheduledDepartureTime, odpt:estimatedTime → odpt:estimatedDepartureTime, odpt:actualTime → odpt:actualDepartureTime, odpt:terminal → odpt:departureAirportTerminal

値の変更: owl:sameAs, odpt:airline (odpt:Airline→odpt:Operator)

プロパティ名の変更と値の変更: odpt:gate → odpt:departureGate

プロパティの追加: odpt:flightInformationSummary, odpt:flightInformationText, odpt:checkInCounter, odpt:viaAirport, odpt:aircraftType

odpt:FlightSchedule, FlightScheduleObject

プロパティ名の変更: odpt:departureTime → odpt:originTime, odpt:arrivalTime → odpt:destinationTime

値の変更: owl:sameAs, odpt:airline (odpt:Airline→odpt:Operator), odpt:flightNumber (配列化)

プロパティ名の変更とプロパティの移動: odpt:departureAirport (FlightScheduleObject内) → odpt:originAirport (FlightSchedule内)

プロパティの移動: odpt:destinationAirport (FlightScheduleObject内) → odpt:destinationAirport (FlightSchedule内)

プロパティの追加: odpt:viaAirport, odpt:aircraftType

その他、誤植などを修正しました。

2018-08-09

odpt:Calendar (曜日・日付), odpt:Operator (事業者), odpt:TrainType (列車種別), odpt:RailDirection (列車の進行方向)を、データダンプ API としても記載しました。

地物情報検索API (/v4/places/RDF_TYPE?) のフィルタリングの記述を修正しました。

odpt:Train (列車情報) 、odpt:TrainTimetable (列車時刻表) 、odpt:StationTimetableObject (駅時刻表のオブジェクト) で、odpt:trainOwner (車両の所属会社) の ID のクラスを、odpt:Operator (事業者) としました。相互乗り入れで運行会社と車両の所属会社が異なる可能性がある場合などに使用します。

odpt:TrainTimetable (列車時刻表) と odpt:StationTimetableObject (駅時刻表のオブジェクト) で、odpt:trainName (列車名) をリスト(配列)に変更しました。これは列車名を複数持つ併結列車などに対応するためです。

odpt:StationTimetableObject (駅時刻表のオブジェクト) に、odpt:trainNumber (列車番号) を追加しました。

odpt:FlightInformationArrival (フライト到着情報) と odpt:FlightInformationDeparture (フライト出発情報) で、odpt:flightNumber (フライト番号) をリスト(配列)に変更しました。これはフライト番号を複数持つ共同運航便などに対応するためです。

その他、誤植などを修正しました。

2018-07-17

2018年1月時点の仕様と比べた主な修正は次のとおりです。

odpt:Calendar (曜日・日付), odpt:Operator (事業者), odpt:TrainType (列車種別), odpt:RailDirection (列車の進行方向)の情報を取得する API の記載を追加しました。

鉄道関係の自然言語による各種の文字列を、多言語対応としました。JSON-LD の language map (e.g. {"ja": "日本語", "en": "English"}) で表します。ただし、dc:title は従来通り日本語のみとし、別プロパティで多言語対応しました。

odpt:TrainTimetable (列車時刻表) と odpt:StationTimetable (駅時刻表) で、odpt:originStation (始発駅)、odpt:destinationStation (終着駅) を文字列からリスト(配列)に変更しました。これは途中で分割されるため行先を複数持つ併結列車などに対応するためです。

odpt:TrainTimetable (列車時刻表) で、odpt:previousTrainTimetable (直前の列車時刻表), odpt:nextTrainTimetable (直後の列車時刻表) を新規に追加しました。これは一つの列車が複数の列車時刻表に分かれて掲載される場合に対応するためです。途中で分割される併結列車などの場合は、直前や直後の列車時刻表が複数になり得るため、リスト(配列)としています。

odpt:PassengerSurvey (駅別乗降人員数) の仕様を変更しました。これは同一の駅名で路線別に乗降人員数の統計が分かれている場合などに対応するためです。

Version 4.15
Last updated 2025-11-28 15:00:00 +0900
Copyright © 公共交通オープンデータ協議会プライバシーポリシー

Japanese
