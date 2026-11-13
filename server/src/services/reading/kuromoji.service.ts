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

  static async analyzeText(text: string): Promise<{ furiganaText: string; vocabularies: any[]; grammars: any[] }> {
    try {
      const tokenizer = await this.getTokenizer();
      const tokens = tokenizer.tokenize(text);
      let furiganaText = '';

      const vocabMap = new Map<string, any>();
      const grammarMap = new Map<string, any>();

      for (const token of tokens) {
        // --- 1. Tạo Furigana ---
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

        // --- 2. Trích xuất Vocabulary ứng viên (Ưu tiên từ Kanji >= 2 ký tự hoặc Katakana công nghệ/thời sự) ---
        const pos = token.pos;
        const base = token.basic_form && token.basic_form !== '*' ? token.basic_form : token.surface_form;
        if (!base || base.length < 2) continue;

        const isKanjiWord = this.hasKanji(base);
        const isKatakanaWord = /^[\u30A0-\u30FF\u30FC]{2,12}$/.test(base);
        if (!isKanjiWord && !isKatakanaWord) continue;

        // Bỏ qua các từ thuộc nội dung tài trợ / xin tiền / quảng cáo
        const isJunkWord = ['支援', 'メンバー', 'リスト', '寄付', '価格高騰', '危険水域', '運営', 'ご存じ'].some(j => base.includes(j));
        if (isJunkWord) continue;

        if (pos === '名詞' || pos === '動詞' || pos === '形容詞') {
          if (
            token.pos_detail_1 !== '数' &&
            token.pos_detail_1 !== '非自立' &&
            token.pos_detail_1 !== '接尾' &&
            token.pos_detail_1 !== '代名詞'
          ) {
            if (!vocabMap.has(base)) {
              const readingHira = token.reading ? this.katakanaToHiragana(token.reading) : (isKatakanaWord ? this.katakanaToHiragana(base) : '');
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

      // --- 3. Nhận diện Ngữ pháp JLPT thực tế có trong văn bản ---
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
            meaningVi: pat.meaningVi,
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
    const res = await this.analyzeText(text);
    return res.furiganaText;
  }
}
