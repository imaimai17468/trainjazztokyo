import { createSignal } from "solid-js";
import type { Instrument } from "../MapView.timetable";

type LineEntry = {
  code: string;
  name: string;
  instrument: Instrument;
  flavor: string;
};

const ROWS: LineEntry[][] = [
  [
    {
      code: "JY",
      name: "山手線",
      instrument: "bass",
      flavor:
        "ウォーキングベースが聴こえます。山手線は東京をぐるりと一周する環状線──終点のない、終わらないベースライン。列車が連なると、一つの長い音が円を描いて持続します。",
    },
    {
      code: "JC",
      name: "中央線快速",
      instrument: "bass",
      flavor:
        "ウォーキングベースが聴こえます。中央線快速は東京を東西にまっすぐ貫くオレンジの幹線。ジャズコンボの土台となるルート音を、力強く正確に刻みます。列車が詰まると、低音が一つに溶け合います。",
    },
    {
      code: "JK",
      name: "京浜東北線",
      instrument: "bass",
      flavor:
        "ウォーキングベースが聴こえます。京浜東北線は首都圏を南北に縦断する大動脈。低く安定したグルーヴが、一日中リズムを刻み続けます。",
    },
    {
      code: "JB",
      name: "中央・総武緩行線",
      instrument: "bass",
      flavor:
        "ウォーキングベースが聴こえます。黄色い各駅停車が街を丁寧になぞる。快速の裏で、もう一本のベースラインが静かにうねっています。",
    },
  ],
  [
    {
      code: "G",
      name: "東京メトロ銀座線",
      instrument: "piano",
      flavor:
        "ローズ・ピアノが聴こえます。銀座線は1927年開業、日本最古の地下鉄。ジャズの歴史がそのままピアノの最初の一音になりました。列車が近づくと、コードが一つ鳴ります。",
    },
    {
      code: "M",
      name: "東京メトロ丸ノ内線",
      instrument: "piano",
      flavor:
        "ローズ・ピアノが聴こえます。丸ノ内線は赤い車体で都心を弧を描いて走る。温かなコード・ヴォイシングが、池袋から荻窪まで響きます。",
    },
    {
      code: "H",
      name: "東京メトロ日比谷線",
      instrument: "piano",
      flavor:
        "ローズ・ピアノが聴こえます。日比谷線は北千住から中目黒まで、下町と山の手を繊細なタッチでつなぐ。やわらかいコードが街の境界を溶かします。",
    },
    {
      code: "T",
      name: "東京メトロ東西線",
      instrument: "vibraphone",
      flavor:
        "ヴィブラフォンが聴こえます。東西線は東京で最も混雑する路線──マレットが鍵盤を叩くたびに、密集した列車の振動が金属的な残響を生みます。一本だけ遅れてくる電車は、最後のひと打ち。",
    },
  ],
  [
    {
      code: "A",
      name: "都営浅草線",
      instrument: "trombone",
      flavor:
        "ジャズ・トロンボーンが聴こえます──ゆったりと歌うリード・ヴォイス。浅草線は浅草から羽田空港へ、下町の空気を太い管の音で運ぶ。列車が長く連なると、音も長く伸びます。",
    },
    {
      code: "S",
      name: "都営新宿線",
      instrument: "trombone",
      flavor:
        "控えめなトロンボーンが聴こえます。新宿線は新宿から千葉方面へ一直線に伸びる──同じホーンで、息を少し抑えた音。スライドをゆっくり引くように、長い路線を一息で吹き切ります。",
    },
    {
      code: "E",
      name: "都営大江戸線",
      instrument: "trombone",
      flavor:
        "ジャズ・トロンボーンが聴こえます。大江戸線は都庁の地下深くを巡る大環状線。列車が続く限り、息の長い旋律が街の底を震わせます。",
    },
  ],
  [
    {
      code: "C",
      name: "東京メトロ千代田線",
      instrument: "saxophone",
      flavor:
        "テナーサックスが聴こえます。千代田線は代々木公園の緑を抜けて大手町へ。風が木々の間を吹き抜けるように、フレーズが呼吸します。列車が途切れると、旋律も息をつきます。",
    },
    {
      code: "Y",
      name: "東京メトロ有楽町線",
      instrument: "saxophone",
      flavor:
        "テナーサックスが聴こえます。有楽町線は金色の路線記号が示すとおり、劇場街のそばを走る。艶やかな音色が、観客のいない深夜にも鳴り続けます。",
    },
    {
      code: "Z",
      name: "東京メトロ半蔵門線",
      instrument: "saxophone",
      flavor:
        "少しピッチの揺れるテナーサックスが聴こえます。半蔵門線は直通運転で路線の境界が曖昧になる──音程が揺れる奏者のように、どこからどこまでが自分の路線か定まりません。",
    },
    {
      code: "N",
      name: "東京メトロ南北線",
      instrument: "saxophone",
      flavor:
        "細い音色のテナーサックスが聴こえます。南北線は東京で最も新しい路線の一つで、まだ存在感が薄い──奏者が控えめに吹いています。",
    },
  ],
  [
    {
      code: "F",
      name: "東京メトロ副都心線",
      instrument: "celesta",
      flavor:
        "チェレスタ──小さなベル型の鍵盤が聴こえます。副都心線は東京で最も新しいメトロ路線。渋谷・新宿・池袋、三つの繁華街をつなぐ透明な音がネオンの間を縫います。",
    },
    {
      code: "JA",
      name: "埼京線",
      instrument: "maracas",
      flavor:
        "マラカスが聴こえます。埼京線は埼玉から渋谷・りんかいエリアへ走る通勤路線。手に持ったマラカスのように、ゆるくシャカシャカと揺れ続けています。",
    },
    {
      code: "I",
      name: "都営三田線",
      instrument: "hihat",
      flavor:
        "クローズド・ハイハットが聴こえます。三田線は目黒から板橋へ、他の都営線より少し控えめに走る。タイトで正確な刻みが、地下深くでリズムを保ちます。",
    },
  ],
  [
    {
      code: "TY",
      name: "東急東横線",
      instrument: "guitar",
      flavor:
        "クリーンなジャズギターが聴こえます。東横線は渋谷から横浜へ、おしゃれな沿線を澄んだトーンで駆け抜ける。列車が連なると、一つのコード・ヴォイシングになります。",
    },
    {
      code: "DT",
      name: "東急田園都市線",
      instrument: "guitar",
      flavor:
        "明るいジャズギターが聴こえます。田園都市線は緑の郊外から渋谷へ。朝のラッシュで弦が密に鳴り、深夜は疎らなアルペジオになります。",
    },
    {
      code: "OH",
      name: "小田急小田原線",
      instrument: "guitar",
      flavor:
        "やわらかいジャズギターが聴こえます。小田急は新宿から箱根の入口へ。遠くへ向かうストロークが、都心を離れるほど余韻を長く残します。",
    },
    {
      code: "KO",
      name: "京王線",
      instrument: "guitar",
      flavor:
        "丸みのあるジャズギターが聴こえます。京王線は新宿から高尾山へ。山に向かって鳴るアルペジオが、標高とともに音を薄くしていきます。",
    },
  ],
  [
    {
      code: "JS",
      name: "湘南新宿ライン",
      instrument: "rimshot",
      flavor:
        "鋭いリムショットが聴こえます。湘南新宿ラインは湘南と都心を結ぶ直通快速──短い一打が、残響なく消えます。目的を持った往復のように。",
    },
    {
      code: "JU",
      name: "上野東京ライン",
      instrument: "hihat",
      flavor:
        "オープン・ハイハットが聴こえます。上野東京ラインは北関東から東海道まで東京を貫く。シンバルのスプラッシュが長く空中に残り、遠くへ遠くへ響いていきます。",
    },
  ],
];

type Props = {
  onHighlight: (lineNames: string[] | null) => void;
};

export default function Legend(props: Props) {
  const [active, setActive] = createSignal<LineEntry | null>(null);

  const handleEnter = (line: LineEntry) => {
    setActive(line);
    props.onHighlight([line.name]);
  };

  const handleLeave = () => {
    setActive(null);
    props.onHighlight(null);
  };

  return (
    <>
      <div class="fixed bottom-4 left-4 z-50 flex flex-col gap-1.5">
        {ROWS.map((row) => (
          <div class="flex gap-0.5">
            {row.map((line) => (
              <img
                src={`/icons/lines/${line.code}.svg`}
                alt={line.name}
                class="h-4.5 w-4.5 cursor-pointer"
                onMouseEnter={() => handleEnter(line)}
                onMouseLeave={handleLeave}
                onClick={() => (active() === line ? handleLeave() : handleEnter(line))}
              />
            ))}
          </div>
        ))}
      </div>
      {active() !== null && (
        <div class="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 max-w-80 text-center text-2.5 leading-relaxed text-gray-500 dark:text-gray-400">
          {active()!.flavor}
        </div>
      )}
    </>
  );
}
