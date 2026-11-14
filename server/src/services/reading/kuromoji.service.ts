import * as kuromoji from 'kuromoji';
import { TranscriptParserService } from '../shadowing/transcript-parser.service';

export interface CuratedGrammarPattern {
  pattern: string;
  regex: RegExp;
  level: string;
  meaningVi: string;
  structure: string;
  explanation: string;
}

export const CURATED_JLPT_GRAMMAR_PATTERNS: CuratedGrammarPattern[] = [
  // --- N3 / N2: Dẫn chứng, trích dẫn, nguyên nhân trong tin tức & báo chí ---
  {
    pattern: '〜によると・〜によれば',
    regex: /(によると|によれば|の調査によると|の発表によると|の試算によると)/,
    level: 'N3',
    meaningVi: 'Theo như... / Dựa theo nguồn tin...',
    structure: 'Danh từ + によると / によれば',
    explanation: 'Cấu trúc thông dụng trong báo chí để trích dẫn nguồn thông tin, kết quả điều tra hoặc thông cáo chính thức.'
  },
  {
    pattern: '〜とのこと（だ）',
    regex: /(とのことだ|とのことです|とのこと、|とのこと。)/,
    level: 'N3',
    meaningVi: 'Nghe nói là... / Theo thông tin được biết là...',
    structure: 'Mệnh đề thông thường + とのこと(だ)',
    explanation: 'Dùng để truyền đạt lại thông tin nhận được từ người khác hoặc thông cáo báo chí một cách khách quan, lịch sự.'
  },
  {
    pattern: '〜によって・〜による',
    regex: /(によって|により|による|によれば)/,
    level: 'N3',
    meaningVi: 'Do / Bằng cách / Tùy thuộc vào / Theo nguồn tin',
    structure: 'Danh từ + によって / による + Danh từ',
    explanation: 'Diễn tả nguyên nhân, phương tiện cách thức, sự khác biệt tùy theo đối tượng, hoặc dẫn nguồn thông tin (theo thống kê/báo cáo).'
  },
  {
    pattern: '〜について・〜につき',
    regex: /(について|についての|に関して|に関する)/,
    level: 'N3',
    meaningVi: 'Về / Liên quan đến vấn đề...',
    structure: 'Danh từ + について / に関して',
    explanation: 'Dùng khi nêu chủ đề, đối tượng đang được bàn luận, nghiên cứu, điều tra hoặc thông báo trong bài báo.'
  },
  {
    pattern: '〜として(は)',
    regex: /(として|としては|としても|としての)/,
    level: 'N3',
    meaningVi: 'Với tư cách là / Coi như là / Dưới góc độ là',
    structure: 'Danh từ + として',
    explanation: 'Xác định tư cách, vai trò, vị trí, danh nghĩa hoặc phân loại của một chủ thể trong xã hội.'
  },
  {
    pattern: '〜に対して・〜に対する',
    regex: /(に対して|に対し|に対する)/,
    level: 'N3',
    meaningVi: 'Đối với / Hướng tới / Ngược lại với',
    structure: 'Danh từ + に対して / に対する + Danh từ',
    explanation: 'Diễn tả thái độ, hành động hướng tới một đối tượng, hoặc đặt hai sự việc đối lập nhau để so sánh.'
  },
  {
    pattern: '〜ため(に)',
    regex: /(ためだ|ためです|ために|ための|ため、)/,
    level: 'N3',
    meaningVi: 'Vì / Do (nguyên nhân) hoặc Để (mục đích)',
    structure: 'Động từ / Tính từ / Danh từ + の + ため(に)',
    explanation: 'Trong văn viết và báo chí, cấu trúc này thường dùng để giải thích nguyên nhân dẫn đến kết quả hoặc mục đích của hành động.'
  },
  {
    pattern: '〜にわたって・〜にわたる',
    regex: /(にわたって|にわたり|にわたる|に渡って|に渡り)/,
    level: 'N2',
    meaningVi: 'Suốt / Kéo dài trong khoảng (thời gian, phạm vi)...',
    structure: 'Danh từ (thời gian / không gian) + にわたって',
    explanation: 'Diễn tả một hành động, sự việc hoặc trạng thái kéo dài liên tục suốt một khoảng thời gian dài hoặc trên quy mô rộng lớn.'
  },
  {
    pattern: '〜をきっかけに・〜を契機に',
    regex: /(をきっかけに|をきっかけとして|を契機に)/,
    level: 'N2',
    meaningVi: 'Nhân dịp... / Bắt nguồn từ... / Khởi điểm từ...',
    structure: 'Danh từ + をきっかけに',
    explanation: 'Chỉ sự kiện, cơ hội hoặc nguyên cớ dẫn tới việc bắt đầu hoặc thay đổi một tình huống mới.'
  },
  {
    pattern: '〜に加え(て)・〜に加えて',
    regex: /(に加え、|に加えて|に加え)/,
    level: 'N2',
    meaningVi: 'Thêm vào đó... / Ngoài ra còn...',
    structure: 'Danh từ + に加え(て)',
    explanation: 'Biểu thị sự bổ sung: không những có A mà còn cộng thêm B nữa.'
  },
  {
    pattern: '〜を中心に・〜を中心として',
    regex: /(を中心に|を中心として|を中心とする)/,
    level: 'N3',
    meaningVi: 'Lấy... làm trọng tâm / Tập trung chủ yếu vào...',
    structure: 'Danh từ + を中心に',
    explanation: 'Chỉ đối tượng, khu vực hoặc phạm vi cốt lõi mà hành động hoặc sự việc tập trung vào.'
  },
  {
    pattern: '〜可能性がある・〜恐れがある',
    regex: /(可能性がある|可能性が高い|おそれがある|恐れがある|影響のおそれ|影響の恐れ|のおそれ|の恐れ)/,
    level: 'N3',
    meaningVi: 'Có khả năng... / Có nguy cơ xảy ra hậu quả xấu',
    structure: 'Thể thông thường / Danh từ + の + 可能性がある / おそれがある',
    explanation: 'Dùng trong dự báo, tin tức để cảnh báo về khả năng diễn biến hoặc rủi ro tiêu cực trong tương lai.'
  },
  {
    pattern: '〜とされる・〜とされている',
    regex: /(とされる|とされている|とされます|とされています)/,
    level: 'N3',
    meaningVi: 'Được cho là... / Được quy định là...',
    structure: 'Thể thông thường + とされる',
    explanation: 'Dùng trong văn phong báo chí để diễn đạt sự nhìn nhận chung, sự thật hiển nhiên hoặc quy định đã được công nhận.'
  },
  {
    pattern: '〜に基づいて・〜に基づく',
    regex: /(に基づいて|に基づき|に基づく|にもとづいて)/,
    level: 'N2',
    meaningVi: 'Dựa trên... / Căn cứ vào...',
    structure: 'Danh từ + に基づいて',
    explanation: 'Lấy sự thật, dữ liệu, luật pháp hoặc nguyên tắc nào đó làm căn cứ nền tảng để hành động hoặc suy xét.'
  },
  {
    pattern: '〜て以来・〜以来',
    regex: /(て以来|ていらい|以来、)/,
    level: 'N2',
    meaningVi: 'Kể từ sau khi... (suốt từ đó đến nay)',
    structure: 'Động từ thể て + 以来',
    explanation: 'Diễn tả một trạng thái tiếp diễn liên tục kể từ một mốc thời gian trong quá khứ cho tới hiện tại.'
  },
  {
    pattern: '〜一方（で）・〜反面',
    regex: /(一方で|一方、|反面、|反面)/,
    level: 'N2',
    meaningVi: 'Mặt khác... / Trái lại / Đồng thời...',
    structure: 'Thể thông thường + 一方(で)',
    explanation: 'So sánh hai mặt đối lập hoặc hai sự việc diễn ra song song của cùng một vấn đề.'
  },
  {
    pattern: '〜わけではない・〜わけだ',
    regex: /(わけではない|わけじゃない|わけだ|わけです)/,
    level: 'N3',
    meaningVi: 'Không hẳn là... / Thảo nào... / Thành ra là...',
    structure: 'Thể thông thường + わけではない',
    explanation: 'Phủ định một phần: không phải hoàn toàn như vậy, hoặc giải thích lý do logic tự nhiên.'
  },
  {
    pattern: '〜に比べて・〜に比べ',
    regex: /(に比べて|に比べ|と比べて)/,
    level: 'N3',
    meaningVi: 'So với...',
    structure: 'Danh từ + に比べて',
    explanation: 'Đem hai đối tượng ra so sánh về mức độ, số lượng hoặc đặc tính.'
  },
  {
    pattern: '〜をはじめ・〜をはじめとする',
    regex: /(をはじめ|をはじめとする|をはじめとして)/,
    level: 'N2',
    meaningVi: 'Trước hết phải kể đến... / Tiêu biểu là...',
    structure: 'Danh từ + をはじめ',
    explanation: 'Nêu ra đại diện tiêu biểu nhất trong một nhóm đối tượng nhiều thành phần.'
  },
  {
    pattern: '〜に沿って・〜に沿い',
    regex: /(に沿って|に沿い|に沿う|にそって)/,
    level: 'N2',
    meaningVi: 'Theo sát... / Dọc theo... / Phù hợp với...',
    structure: 'Danh từ + に沿って',
    explanation: 'Hành động tuân theo đúng đường lối, kế hoạch, quy định hoặc dòng chảy tự nhiên.'
  },
  {
    pattern: '〜に応じて・〜に応じた',
    regex: /(に応じて|に応じ|に応じた)/,
    level: 'N2',
    meaningVi: 'Ứng với... / Tùy theo nhu cầu / Phù hợp với...',
    structure: 'Danh từ + に応じて',
    explanation: 'Sự thay đổi để thích ứng tương xứng với sự biến động của hoàn cảnh, lứa tuổi hoặc yêu cầu.'
  },
  {
    pattern: '〜に違いない',
    regex: /(に違いない|に相違ない)/,
    level: 'N3',
    meaningVi: 'Chắc chắn là... / Không thể sai được',
    structure: 'Thể thông thường + に違いない',
    explanation: 'Khẳng định phán đoán có độ tin cậy rất cao dựa trên chứng cứ hoặc cảm nhận chắc chắn.'
  },
  {
    pattern: '〜はずだ・〜はずがない',
    regex: /(はずだ|はずです|はずがない|はずはありません)/,
    level: 'N3',
    meaningVi: 'Chắc chắn là... / Không có lý nào lại...',
    structure: 'Thể thông thường + はずだ / はずがない',
    explanation: 'Phán đoán dựa trên lý lẽ, quy luật tự nhiên hoặc lịch trình đã biết trước.'
  },
  {
    pattern: '〜最中に・〜最中だ',
    regex: /(最中に|最中だ|最中、)/,
    level: 'N3',
    meaningVi: 'Đúng lúc đang... thì sự việc bất ngờ xảy ra',
    structure: 'V-ている / Danh từ + の + 最中に',
    explanation: 'Nhấn mạnh thời điểm hành động đang diễn ra cao độ thì có một sự cố hoặc việc khác xen vào.'
  },
  {
    pattern: '〜ことになっている・〜ことになった',
    regex: /(ことになっている|ことになります|ことになった|ことになりました)/,
    level: 'N3',
    meaningVi: 'Quy định là... / Đã được quyết định là...',
    structure: 'V-る / V-ない + ことになっている',
    explanation: 'Nói về quy định, tập quán hoặc kế hoạch chung đã được tổ chức/tập thể quyết định.'
  },
  {
    pattern: '〜べきだ・〜べきではない',
    regex: /(べきだ|べきです|べきではない|べきではありません)/,
    level: 'N3',
    meaningVi: 'Nên... / Phải... / Không nên...',
    structure: 'Động từ V-る + べきだ',
    explanation: 'Nêu quan điểm về nghĩa vụ đạo đức, trách nhiệm xã hội hoặc điều hiển nhiên nên làm.'
  },
  {
    pattern: '〜つつある・〜つつ',
    regex: /(つつある|つつあります|つつ、)/,
    level: 'N2',
    meaningVi: 'Đang dần dần... / Vừa... vừa...',
    structure: 'V-ます (bỏ ます) + つつある',
    explanation: 'Miêu tả một tiến trình biến đổi đang tiếp diễn theo chiều hướng tăng dần hoặc giảm dần.'
  },
  {
    pattern: '〜たとたん(に)',
    regex: /(たとたんに|たとたん、|たとたん)/,
    level: 'N3',
    meaningVi: 'Ngay vừa mới... thì xảy ra sự việc bất ngờ',
    structure: 'Động từ V-た + とたんに',
    explanation: 'Hành động phía sau xảy ra gần như tức thì và ngoài dự liệu ngay sau khi hành động trước kết thúc.'
  },
  {
    pattern: '〜たびに',
    regex: /(たびに|たび、)/,
    level: 'N3',
    meaningVi: 'Mỗi lần... lại diễn ra cùng một cảm xúc hoặc hành động',
    structure: 'V-る / Danh từ + の + たびに',
    explanation: 'Nhấn mạnh tính lặp lại quy luật: cứ hễ xảy ra A là chắc chắn sẽ kéo theo B.'
  },
  {
    pattern: '〜わけにはいかない',
    regex: /(わけにはいかない|わけにもいかない)/,
    level: 'N3',
    meaningVi: 'Không thể làm... (do rào cản đạo đức, quy tắc xã hội)',
    structure: 'V-る + わけにはいかない',
    explanation: 'Dù muốn cũng không thể làm vì trách nhiệm, dư luận hoặc lương tâm không cho phép.'
  },
  {
    pattern: '〜上(に)',
    regex: /(上に、|上、|上も|上では)/,
    level: 'N2',
    meaningVi: 'Không những... mà còn... / Xét về phương diện...',
    structure: 'Thể thông thường + 上(に)',
    explanation: 'Cộng thêm tính chất cùng chiều: tốt cộng thêm tốt, hoặc xấu cộng thêm xấu.'
  },
  {
    pattern: '〜次第',
    regex: /(次第だ|次第です|次第で|次第、)/,
    level: 'N2',
    meaningVi: 'Ngay sau khi... / Tùy thuộc vào...',
    structure: 'V-ます (bỏ ます) + 次第 / Danh từ + 次第',
    explanation: 'Chỉ hành động sẽ làm ngay khi điều kiện hoàn thành, hoặc kết quả phụ thuộc vào yếu tố đó.'
  },
  {
    pattern: '〜おかげで・〜せいで',
    regex: /(おかげで|おかげです|せいで|せいです)/,
    level: 'N4',
    meaningVi: 'Nhờ có... (tích cực) / Chỉ tại vì... (tiêu cực)',
    structure: 'Thể thông thường / Danh từ + の + おかげで / せいで',
    explanation: 'Quy kết nguyên nhân dẫn đến kết quả tốt đẹp hoặc hậu quả tồi tệ.'
  },
  {
    pattern: '〜としても・〜としたって',
    regex: /(としても|としたって)/,
    level: 'N3',
    meaningVi: 'Cho dù là... / Dẫu có coi như là...',
    structure: 'Thể thông thường + としても',
    explanation: 'Giả định nhượng bộ: ngay cả khi sự việc đó xảy ra thì kết quả vẫn không thay đổi.'
  },
  {
    pattern: '〜に際して・〜にあたって',
    regex: /(に際して|に際し|にあたって|にあたり)/,
    level: 'N2',
    meaningVi: 'Khi bắt đầu... / Nhân dịp trọng đại...',
    structure: 'Danh từ / V-る + に際して',
    explanation: 'Dùng trong các sự kiện quan trọng, lễ khởi công, ký kết hợp đồng hoặc xuất bản.'
  },
  {
    pattern: '〜から〜にかけて',
    regex: /(から.*にかけて)/,
    level: 'N3',
    meaningVi: 'Từ... trải dài đến...',
    structure: 'Danh từ 1 + から + Danh từ 2 + にかけて',
    explanation: 'Chỉ khoảng thời gian hoặc không gian diễn ra đại khái, ranh giới không phân định quá rạch ròi.'
  },
  {
    pattern: '〜うちに・〜ないうちに',
    regex: /(うちに|うちが|ないうちに)/,
    level: 'N3',
    meaningVi: 'Trong lúc còn... / Tranh thủ trước khi...',
    structure: 'V-る / V-ている / V-ない / Danh từ + の + うちに',
    explanation: 'Tranh thủ làm việc gì đó khi trạng thái thuận lợi vẫn còn duy trì.'
  },
  {
    pattern: '〜末に',
    regex: /(末に|すえに|末、)/,
    level: 'N2',
    meaningVi: 'Sau một hồi lâu... (cuối cùng đạt được kết quả)',
    structure: 'Danh từ + の / V-た + 末に',
    explanation: 'Trải qua quá trình suy nghĩ, đàm phán hoặc cố gắng gian khổ thì đi đến kết luận sau cùng.'
  },
  {
    pattern: '〜ものだ・〜ものではない',
    regex: /(ものだ|ものです|ものではない)/,
    level: 'N3',
    meaningVi: 'Bản chất hiển nhiên là... / Nhớ lại thói quen cũ',
    structure: 'V-る / V-た + ものだ',
    explanation: 'Diễn tả chân lý thông thường, lời khuyên luân lý hoặc hồi tưởng kỷ niệm trong quá khứ.'
  },
  {
    pattern: '〜にすぎない',
    regex: /(にすぎない|にすぎません)/,
    level: 'N2',
    meaningVi: 'Chẳng qua chỉ là... / Không hơn không kém',
    structure: 'Thể thông thường / Danh từ + にすぎない',
    explanation: 'Hạ thấp mức độ đánh giá: chỉ dừng lại ở mức đó chứ không có gì to tát.'
  },
  {
    pattern: '〜にほかならない',
    regex: /(にほかならない)/,
    level: 'N2',
    meaningVi: 'Chính là... / Không gì khác ngoài...',
    structure: 'Danh từ + にほかならない',
    explanation: 'Khẳng định mạnh mẽ lý do hoặc nguyên nhân cốt lõi duy nhất của vấn đề.'
  },
  {
    pattern: '〜に決まっている',
    regex: /(に決まっている|にきまっている)/,
    level: 'N3',
    meaningVi: 'Nhất định là... / Chắc chắn sẽ...',
    structure: 'Thể thông thường + に決まっている',
    explanation: 'Khẳng định phán đoán chủ quan mang tính quả quyết tuyệt đối.'
  },
  {
    pattern: '〜かのようだ',
    regex: /(かのようだ|かのように)/,
    level: 'N3',
    meaningVi: 'Cứ như thể là... (thực tế không phải vậy)',
    structure: 'Thể thông thường + かのようだ',
    explanation: 'So sánh ví von một sự việc trông giống hệt như một hiện tượng khác.'
  },
  {
    pattern: '〜にかかわらず・〜を問わず',
    regex: /(にかかわらず|に関わらず|を問わず)/,
    level: 'N2',
    meaningVi: 'Bất kể là... / Không phân biệt...',
    structure: 'Danh từ + を問わず / にかかわらず',
    explanation: 'Hành động hoặc trạng thái không bị ảnh hưởng bởi tuổi tác, giới tính, thời tiết hay quốc tịch.'
  },
  {
    pattern: '〜にもかかわらず',
    regex: /(にもかかわらず|にも拘らず)/,
    level: 'N2',
    meaningVi: 'Mặc dù vậy... / Dù sự việc diễn ra như thế nhưng...',
    structure: 'Thể thông thường / Danh từ + にもかかわらず',
    explanation: 'Biểu thị sự ngạc nhiên khi kết quả xảy ra trái ngược hoàn toàn với dự đoán thông thường.'
  },
  {
    pattern: '〜ようになる・〜ようになる',
    regex: /(ようになる|ようになった|ようになっている|ようになると|ようになります)/,
    level: 'N4',
    meaningVi: 'Trở nên / Bắt đầu có thể / Dần hình thành trạng thái mới',
    structure: 'Động từ (V-る / V-ない) + ようになる',
    explanation: 'Diễn tả sự biến đổi về trạng thái, thói quen hoặc khả năng theo thời gian (từ chỗ không thể/không làm sang có thể/thường làm).'
  },
  {
    pattern: '〜ことができる',
    regex: /(ことができる|ことができます|ことができ、|することが可能)/,
    level: 'N4',
    meaningVi: 'Có thể làm được việc gì đó',
    structure: 'Động từ thể từ điển (V-る) + ことができる',
    explanation: 'Biểu thị năng lực, khả năng hoặc điều kiện cho phép thực hiện một hành động.'
  },
  {
    pattern: '〜に伴って・〜に伴い',
    regex: /(に伴って|に伴い|に伴う|につれて|にしたがって)/,
    level: 'N2',
    meaningVi: 'Cùng với / Kéo theo sự biến đổi của...',
    structure: 'Danh từ / V-る + に伴って (につれて)',
    explanation: 'Diễn tả hai sự thay đổi diễn ra song hành: khi A thay đổi hoặc phát triển thì B cũng biến đổi kéo theo.'
  },
  {
    pattern: '〜を通じて・〜を通して',
    regex: /(を通じて|を通して|を通じた|を通した)/,
    level: 'N2',
    meaningVi: 'Thông qua / Xuyên suốt (thời gian, phương tiện)',
    structure: 'Danh từ + を通じて / を通して',
    explanation: 'Chỉ phương tiện trung gian giúp đạt được kết quả, hoặc chỉ trạng thái kéo dài suốt một khoảng thời gian (quanh năm).'
  },
  {
    pattern: '〜だけでなく・〜ばかりでなく',
    regex: /(だけでなく|ばかりでなく|のみならず)/,
    level: 'N3',
    meaningVi: 'Không chỉ... mà còn...',
    structure: 'Danh từ / Động từ / Tính từ + だけでなく (のみならず)',
    explanation: 'Nhấn mạnh phạm vi mở rộng: không chỉ dừng lại ở A mà còn bao gồm cả B.'
  },
  {
    pattern: '〜おそれがある・〜かねない',
    regex: /(おそれがある|恐れがある|かねない|かねません)/,
    level: 'N2',
    meaningVi: 'Có nguy cơ / E rằng sẽ xảy ra hậu quả xấu',
    structure: 'Động từ V-る / Danh từ + の + おそれがある (V-ます + かねない)',
    explanation: 'Thường xuất hiện trong bản tin thời tiết, y tế, kinh tế để cảnh báo về một rủi ro hoặc khả năng tiêu cực có thể xảy ra.'
  },
  {
    pattern: '〜をめぐって・〜をめぐる',
    regex: /(をめぐって|をめぐり|をめぐる)/,
    level: 'N2',
    meaningVi: 'Xoay quanh vấn đề / Tranh luận xung quanh...',
    structure: 'Danh từ + をめぐって / をめぐる + Danh từ',
    explanation: 'Dùng khi có nhiều ý kiến, cuộc thảo luận hoặc tranh chấp xoay quanh một sự kiện, chính sách hoặc vấn đề xã hội.'
  },
  {
    pattern: '〜において・〜における',
    regex: /(において|においても|における)/,
    level: 'N2',
    meaningVi: 'Tại / Trong (lĩnh vực, thời điểm, hoàn cảnh)',
    structure: 'Danh từ + において / における + Danh từ',
    explanation: 'Dạng trang trọng của trợ từ で/に, dùng phổ biến trong báo chí và văn bản hành chính để chỉ phạm vi, lĩnh vực hoặc bối cảnh.'
  },
  {
    pattern: '〜とみられる・〜とみられている',
    regex: /(とみられる|と見られる|とみられている|と見られている|とみられています)/,
    level: 'N2',
    meaningVi: 'Được cho là / Được nhận định là',
    structure: 'Mệnh đề thông thường + とみられる',
    explanation: 'Cấu trúc đặc trưng của báo chí Nhật Bản (NHK, Asahi...) dùng để nêu nhận định, phán đoán khách quan dựa trên thông tin thu thập được.'
  },
  {
    pattern: '〜方針（ほうしん）・〜見通し（みとおし）',
    regex: /(方針を固め|方針を示し|見通しとなっ|見通しだ|見込みだ|見込みです)/,
    level: 'N2',
    meaningVi: 'Dự kiến / Theo phương hướng / Triển vọng sẽ...',
    structure: 'Động từ V-る + 方針だ / 見通しだ / 見込みだ',
    explanation: 'Thuật ngữ báo chí chỉ kế hoạch, chủ trương sắp thực hiện của chính phủ/tổ chức hoặc dự báo diễn biến sắp tới.'
  },
  // --- Mở rộng ngữ pháp thiết yếu N5 - N1 xuất hiện thường xuyên trong báo chí & đời sống ---
  {
    pattern: '〜ている・〜ていた（〜ており）',
    regex: /(ている|ていた|ています|ていました|ており、|ておりま|でいる|でいた)/,
    level: 'N5',
    meaningVi: 'Đang diễn ra / Trạng thái duy trì / Thói quen hoặc kết quả còn lưu lại',
    structure: 'Động từ thể て + いる / いた / おり',
    explanation: 'Diễn tả hành động đang xảy ra, trạng thái kéo dài, hoặc kết quả của hành động vẫn đang tồn tại ở thời điểm hiện tại.'
  },
  {
    pattern: '〜てみる・〜てみませんか',
    regex: /(てみる|てみた|てみます|てみました|てみませんか|てみても|てみよう)/,
    level: 'N4',
    meaningVi: 'Thử làm gì đó (xem sao)',
    structure: 'Động từ thể て + みる',
    explanation: 'Thể hiện sự thử nghiệm một hành động để trải nghiệm kết quả; dạng 〜てみませんか mang sắc thái mời mọc, gợi ý nhẹ nhàng.'
  },
  {
    pattern: '〜てしまう・〜てしまった',
    regex: /(てしまう|てしまった|てしまいます|てしまいました|でしまう|でしまった)/,
    level: 'N4',
    meaningVi: 'Lỡ làm mất rồi / Hoàn tất triệt để một việc gì đó',
    structure: 'Động từ thể て + しまう',
    explanation: 'Diễn tả hành động đã hoàn thành xong hoàn toàn, hoặc hàm ý tiếc nuối vì một kết quả xảy ra ngoài ý muốn.'
  },
  {
    pattern: '〜ておく',
    regex: /(ておく|ておいた|ておきます|ておくと|ておけば|でおく)/,
    level: 'N4',
    meaningVi: 'Làm sẵn trước để chuẩn bị / Giữ nguyên trạng thái',
    structure: 'Động từ thể て + おく',
    explanation: 'Chuẩn bị trước một việc gì đó để phục vụ cho bước tiếp theo hoặc duy trì nguyên trạng thái sẵn có.'
  },
  {
    pattern: '〜ていく・〜てくる',
    regex: /(ていく|ていった|ていきます|てくる|てきた|てきます|てきました)/,
    level: 'N4',
    meaningVi: 'Tiếp tục phát triển dần (tới tương lai) / Đã diễn biến đến hiện tại',
    structure: 'Động từ thể て + いく / くる',
    explanation: '〜ていく chỉ xu hướng biến đổi hướng về tương lai; 〜てくる chỉ quá trình thay đổi kéo dài từ quá khứ cho đến hiện tại.'
  },
  {
    pattern: '〜ことになる・〜ことになっている',
    regex: /(ことになる|ことになった|ことになります|ことになりました|ことになっている|ことにする|ことにした)/,
    level: 'N4',
    meaningVi: 'Được quyết định rằng / Có quy định là / Quyết định làm',
    structure: 'V-る / V-ない + ことになる / ことにする',
    explanation: '〜ことになる diễn tả kết quả hoặc quyết định khách quan từ tập thể/hoàn cảnh; 〜ことにする diễn tả quyết định chủ quan của bản thân.'
  },
  {
    pattern: '〜ように・〜ような',
    regex: /(ように、|ような|ようです|ようだ|ようにする|ようにして|ようになる)/,
    level: 'N4',
    meaningVi: 'Để mà... / Như là... / Giống như là...',
    structure: 'V-る / N + の + ように / ような',
    explanation: 'Dùng để nêu mục đích hướng tới (để cho), đưa ví dụ minh họa (như là), hoặc mô tả sự tương đồng về trạng thái.'
  },
  {
    pattern: '〜やすい・〜にくい',
    regex: /(やすい|やすく|やすさ|にくい|にくく|にくさ|づらい|づらく)/,
    level: 'N4',
    meaningVi: 'Dễ làm... / Khó làm... (tính chất thao tác, xu hướng)',
    structure: 'Động từ thể ます (bỏ ます) + やすい / にくい / づらい',
    explanation: 'Đánh giá mức độ thuận tiện hay trở ngại khi thực hiện một hành động, hoặc khuynh hướng dễ/khó xảy ra hiện tượng.'
  },
  {
    pattern: '〜すぎる',
    regex: /(すぎる|すぎた|すぎます|すぎて|すぎない)/,
    level: 'N4',
    meaningVi: 'Quá mức... (vượt quá giới hạn thông thường)',
    structure: 'V-ます / A-い / Na + すぎる',
    explanation: 'Diễn tả mức độ tính chất hoặc hành động vượt quá ngưỡng bình thường (quá nhiều, quá nóng, làm quá tay).'
  },
  {
    pattern: '〜かもしれない',
    regex: /(かもしれない|かもしれません|かもしれなかった)/,
    level: 'N4',
    meaningVi: 'Có lẽ / Có khả năng là... (không chắc chắn hoàn toàn)',
    structure: 'Thể thông thường + かもしれない',
    explanation: 'Đưa ra phán đoán phỏng đoán có xác suất xảy ra nhưng chưa khẳng định chắc chắn.'
  },
  {
    pattern: '〜はずだ・〜はずがない',
    regex: /(はずだ|はずです|はずがない|はずがありません|はずだった)/,
    level: 'N4',
    meaningVi: 'Chắc chắn phải là... (theo suy luận logic) / Không thể nào có chuyện...',
    structure: 'Thể thông thường (Nの / Naな) + はずだ',
    explanation: 'Suy đoán có căn cứ logic hoặc dựa trên quy luật khách quan rằng điều gì đó đáng lý phải xảy ra như vậy.'
  },
  {
    pattern: '〜ながら',
    regex: /(ながら、|ながらも|ながら)/,
    level: 'N4',
    meaningVi: 'Vừa làm việc này vừa làm việc kia / Tuy vậy nhưng...',
    structure: 'V-ます (bỏ ます) + ながら',
    explanation: 'Diễn tả hai hành động diễn ra song song đồng thời cùng một chủ thể; dạng ながらも mang nghĩa nhượng bộ "tuy... nhưng".'
  },
  {
    pattern: '〜たり〜たりする',
    regex: /(たり[^。]{1,28}たり)/,
    level: 'N4',
    meaningVi: 'Lúc thì làm A, lúc thì làm B (liệt kê hành động tiêu biểu)',
    structure: 'V-た + り、V-た + りする',
    explanation: 'Liệt kê một số hành động hoặc trạng thái tiêu biểu mang tính đại diện trong nhiều việc khác nhau.'
  },
  {
    pattern: '〜なければならない・〜なくてはならない',
    regex: /(なければならない|なければなりません|なくてはならない|ねばならない)/,
    level: 'N4',
    meaningVi: 'Phải / Bắt buộc phải làm...',
    structure: 'V-ない (bỏ い) + ければならない',
    explanation: 'Diễn tả nghĩa vụ, yêu cầu bắt buộc hoặc điều tất yếu phải thực hiện trong hoàn cảnh đó.'
  },
  {
    pattern: '〜といわれている・〜とされている',
    regex: /(といわれ|と言われ|とされて|とされている|とされています)/,
    level: 'N3',
    meaningVi: 'Người ta nói rằng... / Được xem là... / Được nhìn nhận là...',
    structure: 'Mệnh đề + といわれている / とされている',
    explanation: 'Thể bị động trích dẫn nhận định phổ biến trong xã hội, giới chuyên môn hoặc báo chí.'
  },
  {
    pattern: '〜ということだ・〜ということになる',
    regex: /(ということだ|ということです|ということになり|ということは)/,
    level: 'N3',
    meaningVi: 'Có nghĩa là... / Tức là chuyện...',
    structure: 'Mệnh đề thông thường + ということだ',
    explanation: 'Giải thích lại ý nghĩa cốt lõi, kết luận suy ra hoặc tường thuật gián tiếp nội dung vừa nêu.'
  },
  {
    pattern: '〜にとって（は）',
    regex: /(にとって|にとっては|にとっても|にとっての)/,
    level: 'N3',
    meaningVi: 'Đối với (lập trường, góc nhìn của ai/tổ chức nào)',
    structure: 'Danh từ + にとって',
    explanation: 'Đánh giá sự việc dưới góc độ hoặc vị trí của một chủ thể cụ thể (đối với người tiêu dùng, đối với doanh nghiệp...).'
  },
  {
    pattern: '〜をもとに・〜に基づいて',
    regex: /(をもとに|を基に|に基づいて|に基づき|に基づく)/,
    level: 'N3',
    meaningVi: 'Dựa trên cơ sở... / Căn cứ vào...',
    structure: 'Danh từ + をもとに / に基づいて',
    explanation: 'Chỉ nền tảng, số liệu, quy định hoặc ý tưởng gốc được dùng để phát triển hành động tiếp theo.'
  },
  {
    pattern: '〜を中心に（して）',
    regex: /(を中心に|を中心とした|を中心として)/,
    level: 'N3',
    meaningVi: 'Lấy ... làm trung tâm / Tập trung chủ yếu vào...',
    structure: 'Danh từ + を中心に',
    explanation: 'Xác định nhân vật, khu vực hoặc chủ đề đóng vai trò nòng cốt trong sự kiện.'
  },
  {
    pattern: '〜をはじめ（として）',
    regex: /(をはじめ|を初め|をはじめとする)/,
    level: 'N2',
    meaningVi: 'Trước hết phải kể đến... / Tiêu biểu là...',
    structure: 'Danh từ + をはじめ（として）',
    explanation: 'Nêu một ví dụ tiêu biểu, đại diện nhất trước khi mở rộng ra nhiều đối tượng tương tự khác.'
  },
  {
    pattern: '〜にわたって・〜にわたり',
    regex: /(にわたって|にわたり|にわたる|にわたった)/,
    level: 'N2',
    meaningVi: 'Trải dài suốt... / Trên phạm vi rộng...',
    structure: 'Danh từ (thời gian / không gian / lĩnh vực) + にわたって',
    explanation: 'Nhấn mạnh quy mô rộng lớn hoặc khoảng thời gian kéo dài liên tục của một sự kiện.'
  },
  {
    pattern: '〜をきっかけに・〜を機に',
    regex: /(をきっかけに|をきっかけとして|を機に)/,
    level: 'N3',
    meaningVi: 'Nhân cơ hội / Lấy đó làm bước ngoặt, nguyên nhân khởi đầu...',
    structure: 'Danh từ + をきっかけに / を機に',
    explanation: 'Diễn tả một sự kiện mở đường dẫn tới sự thay đổi hoặc hành động mới tiếp nối sau đó.'
  },
  {
    pattern: '〜ことから',
    regex: /(ことから、|ことから)/,
    level: 'N3',
    meaningVi: 'Từ việc... / Xuất phát từ lý do...',
    structure: 'Thể thông thường + ことから',
    explanation: 'Nêu nguyên nhân, căn cứ khách quan dẫn tới một tên gọi, hiện tượng hoặc kết luận.'
  },
  {
    pattern: '〜一方で（は）',
    regex: /(一方で|一方では|一方、)/,
    level: 'N3',
    meaningVi: 'Mặt khác / Trong khi đó thì...',
    structure: 'Thể thông thường + 一方で',
    explanation: 'Trình bày hai mặt song song hoặc đối lập nhau của cùng một vấn đề, xu hướng.'
  },
  {
    pattern: '〜うえに・〜うえで',
    regex: /(うえで|上で|うえに|上に|うえでは)/,
    level: 'N3',
    meaningVi: 'Không những... mà còn thêm... / Sau khi làm... thì...',
    structure: 'Thể thông thường + うえに / V-た + うえで',
    explanation: '〜うえに liệt kê thêm yếu tố cộng dồn cùng chiều; V-た + うえで chỉ bước tiền đề trước khi quyết định bước sau.'
  },
  {
    pattern: '〜際に・〜にあたって',
    regex: /(際に|に際して|にあたって|にあたり)/,
    level: 'N3',
    meaningVi: 'Khi / Nhân dịp / Trước thềm thực hiện...',
    structure: 'V-る・V-た / Nの + 際に / にあたって',
    explanation: 'Cách nói trang trọng chỉ thời điểm diễn ra sự kiện hoặc bước chuẩn bị khi bắt đầu công việc quan trọng.'
  },
  {
    pattern: '〜たびに・〜うちに',
    regex: /(たびに|度に|うちに|あいだに)/,
    level: 'N3',
    meaningVi: 'Mỗi lần... / Trong lúc đang... (thì xảy ra biến đổi)',
    structure: 'V-る / Nの + たびに・うちに',
    explanation: '〜たびに nhấn mạnh sự lặp lại hễ A thì B; 〜うちに chỉ sự việc diễn ra nhân lúc trạng thái A còn duy trì.'
  },
  {
    pattern: '〜ものの・〜にもかかわらず',
    regex: /(ものの、|とはいえ)/,
    level: 'N2',
    meaningVi: 'Tuy nói là... nhưng mà... / Mặc dù công nhận vế trước nhưng...',
    structure: 'Thể thông thường + ものの / とはいえ',
    explanation: 'Thừa nhận thực tế ở mệnh đề trước nhưng đưa ra thực trạng hoặc kết quả kém kỳ vọng ở mệnh đề sau.'
  },
  {
    pattern: '〜わけではない・〜とは限らない',
    regex: /(わけではない|わけではありません|というわけではない|とは限らない|とは限りません)/,
    level: 'N3',
    meaningVi: 'Không hẳn là... / Không phải lúc nào cũng...',
    structure: 'Thể thông thường + わけではない / とは限らない',
    explanation: 'Phủ nhận một phần nhận định hoặc tránh khái quát hóa tuyệt đối một vấn đề.'
  },
  {
    pattern: '〜つつある',
    regex: /(つつある|つつあります|つつあった)/,
    level: 'N2',
    meaningVi: 'Đang dần dần chuyển biến theo hướng...',
    structure: 'Động từ V-ます (bỏ ます) + つつある',
    explanation: 'Văn phong báo chí trang trọng mô tả một xu hướng đang diễn tiến từng bước theo thời gian.'
  },
  {
    pattern: '〜ざるを得ない・〜ほかない',
    regex: /(ざるを得ない|ざるをえない|ほかない|しかない)/,
    level: 'N2',
    meaningVi: 'Buộc lòng phải... / Không còn cách nào khác ngoài...',
    structure: 'V-ない + ざるを得ない / V-る + しかない',
    explanation: 'Diễn tả tình thế bắt buộc dù không muốn nhưng vẫn phải lựa chọn thực hiện.'
  },
  {
    pattern: '〜とともに・〜に加えて',
    regex: /(とともに|と共に|に加えて|に加え、|にくわえ)/,
    level: 'N2',
    meaningVi: 'Cùng với... / Thêm vào đó, cộng với...',
    structure: 'Danh từ / V-る + とともに・に加えて',
    explanation: 'Nối thêm yếu tố xảy ra song hành hoặc gia tăng tác động cùng lúc.'
  },
  {
    pattern: '〜ため（に）・〜ので',
    regex: /(ため、|ために|ためだ|ためです|ので、)/,
    level: 'N4',
    meaningVi: 'Vì / Do nguyên nhân... / Để phục vụ mục đích...',
    structure: 'Thể thông thường (Nの) + ため（に）/ ので',
    explanation: 'Nêu nguyên nhân khách quan dẫn đến kết quả hoặc mục đích của hành động.'
  },
  {
    pattern: '〜背景には・〜傾向がある',
    regex: /(背景には|を背景に|傾向がある|傾向にある|傾向が強)/,
    level: 'N2',
    meaningVi: 'Đằng sau bối cảnh đó có... / Có khuynh hướng...',
    structure: 'Danh từ / Mệnh đề + を背景に・傾向がある',
    explanation: 'Cách diễn đạt phân tích nguyên nhân sâu xa hoặc xu thế phổ biến trong xã hội và thị trường.'
  }
];

export class KuromojiService {
  /**
   * Tái sử dụng chung 1 instance Kuromoji Tokenizer với TranscriptParserService
   * Tiết kiệm ~45MB RAM trên Render Free Tier
   */
  static async getTokenizer(): Promise<kuromoji.Tokenizer<kuromoji.IpadicFeatures>> {
    return await TranscriptParserService.getTokenizer();
  }

  static isKanji(ch: string): boolean {
    return (ch >= '\u4e00' && ch <= '\u9faf') || (ch >= '\u3400' && ch <= '\u4dbf');
  }

  static hasKanji(str: string): boolean {
    for (let i = 0; i < str.length; i++) {
      if (this.isKanji(str[i])) return true;
    }
    return false;
  }

  static katakanaToHiragana(kata: string): string {
    return kata.replace(/[\u30A1-\u30F6]/g, function (match) {
      const chr = match.charCodeAt(0) - 0x60;
      return String.fromCharCode(chr);
    });
  }

  static formatPosVi(pos: string): string {
    if (pos === '名詞') return 'Danh từ';
    if (pos === '動詞') return 'Động từ';
    if (pos === '形容詞') return 'Tính từ';
    if (pos === '副詞') return 'Phó từ';
    return 'Từ vựng';
  }

  private static renderFuriganaFromTokens(tokens: kuromoji.IpadicFeatures[]): string {
    let furiganaText = '';
    for (const token of tokens) {
      if (this.hasKanji(token.surface_form) && token.reading) {
        const readingHiragana = this.katakanaToHiragana(token.reading);
        let surface = token.surface_form;
        let reading = readingHiragana;

        let tail = '';
        while (
          surface.length > 0 &&
          reading.length > 0 &&
          !this.isKanji(surface[surface.length - 1]) &&
          surface[surface.length - 1] === reading[reading.length - 1]
        ) {
          tail = surface[surface.length - 1] + tail;
          surface = surface.slice(0, -1);
          reading = reading.slice(0, -1);
        }

        let head = '';
        while (
          surface.length > 0 &&
          reading.length > 0 &&
          !this.isKanji(surface[0]) &&
          surface[0] === reading[0]
        ) {
          head += surface[0];
          surface = surface.slice(1);
          reading = reading.slice(1);
        }

        if (surface.length > 0 && reading.length > 0) {
          furiganaText += `${head}<ruby>${surface}<rt>${reading}</rt></ruby>${tail}`;
        } else {
          furiganaText += token.surface_form;
        }
      } else {
        furiganaText += token.surface_form;
      }
    }
    return furiganaText;
  }

  static async analyzeText(text: string): Promise<{ furiganaText: string; vocabularies: any[]; grammars: any[] }> {
    try {
      const tokenizer = await this.getTokenizer();
      const tokens = tokenizer.tokenize(text);
      const furiganaText = this.renderFuriganaFromTokens(tokens);

      const vocabMap = new Map<string, any>();
      const grammarMap = new Map<string, any>();

      for (let tIdx = 0; tIdx < tokens.length; tIdx++) {
        const token = tokens[tIdx];
        // --- Trích xuất Vocabulary ứng viên (Ưu tiên từ Kanji >= 2 ký tự hoặc từ Katakana nguyên vẹn >= 3 ký tự) ---
        const pos = token.pos;
        let base = token.basic_form && token.basic_form !== '*' ? token.basic_form : token.surface_form;
        if (!base || base.length < 2) continue;

        const isKanjiWord = this.hasKanji(base);
        const isKanaPiece = /^[\u30A0-\u30FF\u30FC]+$/.test(token.surface_form);

        // Nếu Kuromoji tách 1 từ Katakana dài thành nhiều mảnh (vd クラ + ウド), gộp nguyên chuỗi Katakana liên tiếp
        let readingOverride = '';
        if (isKanaPiece) {
          const prevIsKata = tIdx > 0 && /^[\u30A0-\u30FF\u30FC]+$/.test(tokens[tIdx - 1].surface_form);
          if (prevIsKata) continue; // Đã được gộp từ token đầu chuỗi Katakana
          let mergedKata = token.surface_form;
          let look = tIdx + 1;
          while (look < tokens.length && /^[\u30A0-\u30FF\u30FC]+$/.test(tokens[look].surface_form)) {
            mergedKata += tokens[look].surface_form;
            look++;
          }
          if (mergedKata.length < 3 || mergedKata.length > 14) continue;
          base = mergedKata;
          readingOverride = mergedKata;
        }

        const isKatakanaWord = /^[\u30A0-\u30FF\u30FC]{3,14}$/.test(base);
        if (!isKanjiWord && !isKatakanaWord) continue;

        // Bỏ qua các từ thuộc nội dung tài trợ / xin tiền / quảng cáo
        const isJunkWord = ['支援', 'メンバー', 'リスト', '寄付', '価格高騰', '危険水域', 'ご存じ', '続きを読む'].some(j => base.includes(j));
        if (isJunkWord) continue;

        if (isKatakanaWord || pos === '名詞' || pos === '動詞' || pos === '形容詞') {
          if (
            token.pos_detail_1 !== '数' &&
            token.pos_detail_1 !== '非自立' &&
            token.pos_detail_1 !== '接尾' &&
            token.pos_detail_1 !== '代名詞' &&
            token.pos_detail_1 !== '固有名詞'
          ) {
            if (!vocabMap.has(base)) {
              const readingHira = readingOverride || (token.reading ? this.katakanaToHiragana(token.reading) : base);
              vocabMap.set(base, {
                word: base,
                reading: readingHira,
                meaning: '',
                meaningVi: '',
                pos: this.formatPosVi(pos),
                level: 'N3',
                examples: []
              });
            }
          }
        }
      }

      // --- Nhận diện Ngữ pháp JLPT thực tế có trong văn bản ---
      const rawSentences = text
        .split(/(?<=[。！？\n])/)
        .map((s) => s.trim())
        .filter(Boolean);

      for (const pat of CURATED_JLPT_GRAMMAR_PATTERNS) {
        if (grammarMap.size >= 12) break;
        const matchedSentence = rawSentences.find((s) => pat.regex.test(s));
        if (matchedSentence || pat.regex.test(text)) {
          grammarMap.set(pat.pattern, {
            grammar: pat.pattern,
            grammarPoint: pat.pattern,
            meaning: pat.meaningVi,
            meaningVi: `${pat.meaningVi} (${pat.structure})`,
            structure: pat.structure,
            level: pat.level,
            explanation: pat.explanation,
            excerpt: matchedSentence || '',
            examples: []
          });
        }
      }

      return {
        furiganaText,
        vocabularies: Array.from(vocabMap.values()).slice(0, 20),
        grammars: Array.from(grammarMap.values()).slice(0, 12)
      };
    } catch (e) {
      console.error('Error in KuromojiService.analyzeText:', e);
      return { furiganaText: text, vocabularies: [], grammars: [] };
    }
  }

  static async addFurigana(text: string): Promise<string> {
    try {
      const tokenizer = await this.getTokenizer();
      const tokens = tokenizer.tokenize(text);
      return this.renderFuriganaFromTokens(tokens);
    } catch {
      return text;
    }
  }
}
