import { prisma } from '../../core/prisma.service';
import { RedisService } from '../../core/redis.service';

export async function seedReadingArticles() {
  const existingDemo = await prisma.readingArticle.findFirst({
    where: { title: { contains: '単身世帯の増加' } },
    include: { quizzes: { orderBy: { id: 'asc' } } }
  });

  const fullTranslationText = `【Đoạn 1】
Gần đây, một trong những thay đổi nổi bật nhất trong xã hội Nhật Bản là số người sống một mình đang gia tăng nhanh chóng. Theo số liệu thống kê, tỷ lệ hộ độc thân chiếm trong tổng số hộ gia đình đã vượt quá một phần ba, và được dự báo sẽ tiếp tục tăng trong tương lai. Hình ảnh một mình đi ăn cơm, một mình xem phim hay một mình đi du lịch nay đã không còn là điều gì xa lạ hay bất thường nữa. Trước đây, nhiều người thường nhìn những ai làm việc một mình bằng ánh mắt ái ngại hay thương cảm, nhưng thế hệ trẻ ngày nay trái lại đã đón nhận việc tận hưởng không gian và thời gian riêng tư như một lối sống hoàn toàn tự nhiên.

【Đoạn 2】
Lý do khiến số hộ độc thân gia tăng là vô cùng đa dạng. Xu hướng kết hôn muộn hoặc hoàn toàn không kết hôn ngày càng phổ biến; số lượng thanh niên sống xa gia đình để theo đuổi việc học hành, công việc cũng nhiều hơn. Cùng với sự gia tăng tuổi thọ trung bình, số người cao tuổi sống cô quạnh sau khi bạn đời qua đời cũng tăng lên đáng kể. Hơn thế nữa, sự chuyển dịch trong hệ giá trị coi trọng tự do cá nhân và quyền riêng tư đã tạo nên tác động sâu sắc. Việc ngày càng nhiều phụ nữ có khả năng tự chủ về kinh tế cũng được xem là một yếu tố then chốt.

【Đoạn 3】
Sự thịnh hành của những trào lưu như "Thịt nướng một người" hay "Karaoke một người" là minh chứng rõ nét cho dòng chảy này. Dùng bữa một mình đã trở thành nét sinh hoạt thường nhật không còn hiếm thấy, và các nhà hàng quán ăn cũng thiết kế các thực đơn riêng phục vụ chu đáo cho khách đi lẻ. Các cuộc điều tra cho thấy, hơn một nửa số người thuộc thế hệ trẻ khẳng định khoảng thời gian ở một mình là điều tuyệt đối không thể thiếu, và rất nhiều người chia sẻ rằng các hoạt động độc lập giúp họ giải tỏa căng thẳng hiệu quả.

【Đoạn 4】
Sự bùng nổ của các hộ độc thân cũng đem lại tác động to lớn đến nền kinh tế. Các doanh nghiệp đang tích cực phát triển nhiều sản phẩm và dịch vụ hướng đến đối tượng khách hàng này. Trong lĩnh vực điện gia dụng, các dòng tủ lạnh và máy giặt cỡ nhỏ dành cho một người liên tục được giới thiệu. Trong ngành thực phẩm, những gói thức ăn chia khẩu phần nhỏ cũng rất được ưa chuộng. Ngoài ra, các tour du lịch thiết kế riêng cho người đi một mình hay các căn hộ chung cư quy mô nhỏ cũng ghi nhận nhu cầu tăng trưởng mạnh mẽ.

【Đoạn 5】
Tuy vậy, xã hội gia tăng người sống một mình cũng làm nảy sinh không ít vấn đề nhức nhối. Trong đó, sự cô lập xã hội và cảm giác cô đơn đang trở thành một thách thức nghiêm trọng. Đặc biệt đối với những người cao tuổi sống đơn thân, một khi mối dây liên kết với xã hội bị cắt đứt, sẽ rất dễ dẫn đến nguy cơ sức khỏe gặp biến cố mà không ai hay biết. Ngay cả ở tầng lớp thanh niên, tình trạng thiếu vắng người để tâm sự, giãi bày khó khăn cũng được xem là một vấn đề đáng lo ngại.

【Đoạn 6】
Xã hội đơn thân có lẽ sẽ còn tiếp tục phát triển hơn nữa trong tương lai. Sống một mình mang lại sự tự do và thuận tiện, song cũng luôn đi kèm với sự cô độc và bất an. Vì lẽ đó, chúng ta không nên chỉ nhìn nhận việc sống một mình như một sự lựa chọn cá nhân đơn thuần, mà toàn xã hội cần chung tay hoàn thiện cơ sở hạ tầng nâng đỡ người độc thân và kiến tạo nên những hình thái cộng đồng mới phù hợp với thời đại.`;

  const quizzesViData = [
    {
      questionVi: 'Đâu là nhận định được nêu trong bài viết về thái độ của thế hệ trẻ ngày nay đối với việc "sống một mình / làm việc một mình"?',
      optionsViJson: JSON.stringify([
        '1. Thấy cô đơn không thể chịu đựng nổi nên muốn né tránh tối đa.',
        '2. Vẫn như trước đây, luôn sợ hãi ánh mắt của người khác nên giấu giếm khi làm.',
        '3. Trái lại, đón nhận một cách tích cực như một phong cách sống tự nhiên để tận hưởng thời gian riêng của chính mình.',
        '4. Bị ép buộc phải chịu đựng do hoàn cảnh kinh tế khó khăn.'
      ])
    },
    {
      questionVi: 'Đâu KHÔNG phải là nguyên nhân khiến số hộ độc thân gia tăng được nêu trong bài viết?',
      optionsViJson: JSON.stringify([
        '1. Xu hướng kết hôn muộn và không kết hôn ngày càng gia tăng.',
        '2. Công ty bắt buộc nhân viên phải sống một mình khi đi làm.',
        '3. Tuổi thọ bình quân tăng khiến số người cao tuổi mất bạn đời tăng lên.',
        '4. Phụ nữ ngày càng tự chủ và độc lập hơn về mặt kinh tế.'
      ])
    },
    {
      questionVi: 'Hành động nào của các doanh nghiệp sau đây phù hợp với nội dung bài viết?',
      optionsViJson: JSON.stringify([
        '1. Khách đơn thân không chi tiêu nhiều nên doanh nghiệp chỉ tập trung vào các mặt hàng cho gia đình.',
        '2. Doanh nghiệp liên tục phát triển và bán các thiết bị gia dụng mini, món ăn chia phần nhỏ và sản phẩm du lịch một mình.',
        '3. Các nhà hàng quán ăn bắt đầu từ chối tiếp nhận khách đi ăn một mình.',
        '4. Nhu cầu mua căn hộ lớn tăng vọt, trong khi giá nhà ở quy mô nhỏ liên tục sụt giảm.'
      ])
    },
    {
      questionVi: 'Liên quan đến người cao tuổi sống một mình, tình huống nguy hiểm nào được tác giả lo ngại nhất trong bài viết?',
      optionsViJson: JSON.stringify([
        '1. Kỹ năng nấu ăn giảm sút dẫn đến thói quen ăn uống thiếu cân bằng dinh dưỡng.',
        '2. Mối liên hệ với xã hội bị cắt đứt, dẫn tới khi sức khỏe gặp biến cố không ai xung quanh phát hiện kịp thời.',
        '3. Gặp khó khăn vì không biết cách sử dụng các đồ điện gia dụng cỡ nhỏ.',
        '4. Đi du lịch quá nhiều dẫn đến tiêu hết tiền tiết kiệm.'
      ])
    },
    {
      questionVi: 'Điều mà tác giả muốn khẳng định và kêu gọi nhất qua bài viết này là gì?',
      optionsViJson: JSON.stringify([
        '1. Sống một mình rất nguy hiểm, vì vậy tất cả mọi người bắt buộc phải kết hôn và sống cùng nhau.',
        '2. Việc độc thân hóa là quyền tự do lựa chọn của mỗi cá nhân, xã hội không cần phải có biện pháp can thiệp nào.',
        '3. Không nên coi sự gia tăng hộ độc thân chỉ là chuyện của riêng mỗi cá nhân, mà toàn xã hội cần cùng nhau xây dựng hạ tầng hỗ trợ và kiến tạo các mô hình cộng đồng mới.',
        '4. Cần mở thêm thật nhiều cơ sở kinh doanh thịt nướng một người và karaoke một người.'
      ])
    }
  ];

  if (existingDemo) {
    if (existingDemo.translationFull) {
      // Đã nâng cấp hoàn tất, bỏ qua để không gây lock timeout khi server khởi động
      return;
    }
    console.log(`📚 [READING SEED] Upgrading existing article "${existingDemo.title}" with full translation & quiz translations...`);
    await prisma.readingArticle.update({
      where: { id: existingDemo.id },
      data: {
        translationFull: fullTranslationText
      }
    });

    for (let i = 0; i < existingDemo.quizzes.length && i < quizzesViData.length; i++) {
      await prisma.readingQuiz.update({
        where: { id: existingDemo.quizzes[i].id },
        data: {
          questionVi: quizzesViData[i].questionVi,
          optionsViJson: quizzesViData[i].optionsViJson
        }
      });
    }

    await RedisService.del(`reading:article:${existingDemo.id}`);
    console.log('✅ [READING SEED] Upgrade completed and cache invalidated.');
    return;
  }

  console.log('🌱 [READING SEED] Seeding authentic JLPT Dokkai articles (Standard JLPT 1,000+ chars)...');

  // BÀI MẪU DEMO CHUẨN ĐỀ THI THẬT JLPT N2 (Ảnh 2 & 3: 単身世帯の増加 - 1.261 ký tự)
  await prisma.readingArticle.create({
    data: {
      title: '単身世帯の増加 (Hộ độc thân ngày càng tăng)',
      sourceType: 'AI_GENERATED',
      level: 'N2',
      topic: 'Xã hội & Đời sống',
      totalWords: 1261,
      durationSeconds: 223, // 3:43
      isPublic: true,
      viewCount: 384,
      translationFull: `【Đoạn 1】
Gần đây, một trong những thay đổi nổi bật nhất trong xã hội Nhật Bản là số người sống một mình đang gia tăng nhanh chóng. Theo số liệu thống kê, tỷ lệ hộ độc thân chiếm trong tổng số hộ gia đình đã vượt quá một phần ba, và được dự báo sẽ tiếp tục tăng trong tương lai. Hình ảnh một mình đi ăn cơm, một mình xem phim hay một mình đi du lịch nay đã không còn là điều gì xa lạ hay bất thường nữa. Trước đây, nhiều người thường nhìn những ai làm việc một mình bằng ánh mắt ái ngại hay thương cảm, nhưng thế hệ trẻ ngày nay trái lại đã đón nhận việc tận hưởng không gian và thời gian riêng tư như một lối sống hoàn toàn tự nhiên.

【Đoạn 2】
Lý do khiến số hộ độc thân gia tăng là vô cùng đa dạng. Xu hướng kết hôn muộn hoặc hoàn toàn không kết hôn ngày càng phổ biến; số lượng thanh niên sống xa gia đình để theo đuổi việc học hành, công việc cũng nhiều hơn. Cùng với sự gia tăng tuổi thọ trung bình, số người cao tuổi sống cô quạnh sau khi bạn đời qua đời cũng tăng lên đáng kể. Hơn thế nữa, sự chuyển dịch trong hệ giá trị coi trọng tự do cá nhân và quyền riêng tư đã tạo nên tác động sâu sắc. Việc ngày càng nhiều phụ nữ có khả năng tự chủ về kinh tế cũng được xem là một yếu tố then chốt.

【Đoạn 3】
Sự thịnh hành của những trào lưu như "Thịt nướng một người" hay "Karaoke một người" là minh chứng rõ nét cho dòng chảy này. Dùng bữa một mình đã trở thành nét sinh hoạt thường nhật không còn hiếm thấy, và các nhà hàng quán ăn cũng thiết kế các thực đơn riêng phục vụ chu đáo cho khách đi lẻ. Các cuộc điều tra cho thấy, hơn một nửa số người thuộc thế hệ trẻ khẳng định khoảng thời gian ở một mình là điều tuyệt đối không thể thiếu, và rất nhiều người chia sẻ rằng các hoạt động độc lập giúp họ giải tỏa căng thẳng hiệu quả.

【Đoạn 4】
Sự bùng nổ của các hộ độc thân cũng đem lại tác động to lớn đến nền kinh tế. Các doanh nghiệp đang tích cực phát triển nhiều sản phẩm và dịch vụ hướng đến đối tượng khách hàng này. Trong lĩnh vực điện gia dụng, các dòng tủ lạnh và máy giặt cỡ nhỏ dành cho một người liên tục được giới thiệu. Trong ngành thực phẩm, những gói thức ăn chia khẩu phần nhỏ cũng rất được ưa chuộng. Ngoài ra, các tour du lịch thiết kế riêng cho người đi một mình hay các căn hộ chung cư quy mô nhỏ cũng ghi nhận nhu cầu tăng trưởng mạnh mẽ.

【Đoạn 5】
Tuy vậy, xã hội gia tăng người sống một mình cũng làm nảy sinh không ít vấn đề nhức nhối. Trong đó, sự cô lập xã hội và cảm giác cô đơn đang trở thành một thách thức nghiêm trọng. Đặc biệt đối với những người cao tuổi sống đơn thân, một khi mối dây liên kết với xã hội bị cắt đứt, sẽ rất dễ dẫn đến nguy cơ sức khỏe gặp biến cố mà không ai hay biết. Ngay cả ở tầng lớp thanh niên, tình trạng thiếu vắng người để tâm sự, giãi bày khó khăn cũng được xem là một vấn đề đáng lo ngại.

【Đoạn 6】
Xã hội đơn thân có lẽ sẽ còn tiếp tục phát triển hơn nữa trong tương lai. Sống một mình mang lại sự tự do và thuận tiện, song cũng luôn đi kèm với sự cô độc và bất an. Vì lẽ đó, chúng ta không nên chỉ nhìn nhận việc sống một mình như một sự lựa chọn cá nhân đơn thuần, mà toàn xã hội cần chung tay hoàn thiện cơ sở hạ tầng nâng đỡ người độc thân và kiến tạo nên những hình thái cộng đồng mới phù hợp với thời đại.`,
      sentences: {
        create: [
          // Đoạn 1
          {
            orderIndex: 1,
            sentenceJp: '最近の日本社会で最も目立つ変化の一つは、一人で暮らす人が急速に増えていることです。',
            sentenceVi: 'Gần đây, một trong những thay đổi nổi bật nhất trong xã hội Nhật Bản là số người sống một mình đang tăng lên nhanh chóng.',
            furigana: '最[さい]近[きん]の日[に]本[ほん]社[しゃ]会[かい]で最[もっと]も目[め]立[だ]つ変[へん]化[か]の一[ひと]つは、一[ひと]人[り]で暮[く]らす人[ひと]が急[きゅう]速[そく]に増[ふ]えていることです。'
          },
          {
            orderIndex: 2,
            sentenceJp: '統計によると、全世帯のうち単身世帯が占める割合はすでに三分の一を超えており、今後も増え続けると見られています。',
            sentenceVi: 'Theo thống kê, tỷ lệ các hộ độc thân chiếm trong tổng số hộ gia đình đã vượt quá một phần ba, và được dự báo sẽ tiếp tục tăng trong tương lai.',
            furigana: '統[とう]計[けい]によると、全[ぜん]世[せ]帯[たい]のうち単[たん]身[しん]世[せ]帯[たい]が占[し]める割[わり]合[あい]はすでに三[さん]分[ぶん]の一[いち]を超[こ]えており、今[こん]後[ご]も増[ふ]え続[つづ]けると見[み]られています。'
          },
          {
            orderIndex: 3,
            sentenceJp: '一人でご飯を食べたり、一人で映画を見たり、一人で旅行に出かけたりする姿は、もう特別なことではありません。',
            sentenceVi: 'Hình ảnh một mình đi ăn cơm, một mình đi xem phim hay một mình đi du lịch nay đã không còn là điều gì đặc biệt nữa.',
            furigana: '一[ひと]人[り]でご飯[はん]を食[た]べたり、一[ひと]人[り]で映[えい]画[が]を見[み]たり、一[ひと]人[り]で旅[りょ]行[こう]に出[で]かけたりする姿[すがた]は、もう特[とく]別[べつ]なことではありません。'
          },
          {
            orderIndex: 4,
            sentenceJp: '以前は一人で何かをする人を気の毒に思う視線が多かったのですが、最近の若い世代はむしろ一人だけの時間を楽しむことを自然な生活スタイルとして受け入れています。',
            sentenceVi: 'Trước đây, có rất nhiều ánh nhìn thương hại dành cho người làm việc gì đó một mình, nhưng thế hệ trẻ ngày nay trái lại đã chấp nhận việc tận hưởng thời gian chỉ riêng mình như một phong cách sống tự nhiên.',
            furigana: '以[い]前[ぜん]は一[ひと]人[り]で何[なに]かをする人[ひと]を気[き]の毒[どく]に思[おも]う視[し]線[せん]が多[おお]かったのですが、最[さい]近[きん]の若[わか]い世[せ]代[だい]はむしろ一[ひと]人[り]だけの時[じ]間[かん]を楽[たの]しむことを自[じ]然[ぜん]な生[せい]活[かつ]スタイルとして受[う]け入[い]れています。'
          },

          // Đoạn 2
          {
            orderIndex: 5,
            sentenceJp: '単身世帯が増える理由はさまざまです。',
            sentenceVi: 'Lý do khiến số hộ độc thân gia tăng là vô cùng đa dạng.',
            furigana: '単[たん]身[しん]世[せ]帯[たい]が増[ふ]える理[り]由[ゆう]はさまざまです。'
          },
          {
            orderIndex: 6,
            sentenceJp: '結婚を遅らせたり、まったくしなかったりする人が多くなり、学業や仕事のために家族と離れて暮らす若者も増えました。',
            sentenceVi: 'Số người kết hôn muộn hoặc hoàn toàn không kết hôn ngày càng nhiều, và những người trẻ sống xa gia đình vì học hành hay công việc cũng gia tăng.',
            furigana: '結[けっ]婚[こん]を遅[おく]らせたり、まったくしなかったりする人[ひと]が多[おお]くなり、学[がく]業[ぎょう]や仕[し]事[ごと]のために家[か]族[ぞく]と離[はな]れて暮[く]らす若[わか]者[もの]も増[ふ]えました。'
          },
          {
            orderIndex: 7,
            sentenceJp: '平均寿命が延びるにつれて、配偶者を先に見送り、一人残される高齢者も多くなりました。',
            sentenceVi: 'Cùng với sự gia tăng tuổi thọ trung bình, số lượng người cao tuổi tiễn đưa bạn đời đi trước và ở lại một mình cũng ngày một nhiều.',
            furigana: '平[へい]均[きん]寿[じゅ]命[みょう]が延[の]びるにつれて、配[はい]偶[ぐう]者[しゃ]を先[さき]に見[み]送[おく]り、一[ひと]人[り]残[のこ]される高[こう]齢[れい]者[しゃ]も多[おお]くなりました。'
          },
          {
            orderIndex: 8,
            sentenceJp: 'さらに、個人の自由やプライバシーを大切にする価値観の変化も大きな影響を与えました。',
            sentenceVi: 'Hơn thế nữa, sự thay đổi trong hệ giá trị coi trọng tự do cá nhân và quyền riêng tư cũng mang lại ảnh hưởng to lớn.',
            furigana: 'さらに、個[こ]人[じん]の自[じ]由[ゆう]やプライバシーを大[たい]切[せつ]にする価[か]値[ち]観[かん]の変[へん]化[か]も大[おお]きな影[えい]響[きょう]を与[あた]えました。'
          },
          {
            orderIndex: 9,
            sentenceJp: '経済的に自立できる女性が増えたことも、重要な理由の一つに挙げられます。',
            sentenceVi: 'Việc phụ nữ có thể tự lập về mặt kinh tế ngày càng tăng cũng được xem là một trong những nguyên nhân quan trọng.',
            furigana: '経[けい]済[ざい]的[てき]に自[じ]立[りつ]できる女[じょ]性[せい]が増[ふ]えたことも、重[じゅう]要[よう]な理[り]由[ゆう]の一[ひと]つに挙[あ]げられます。'
          },

          // Đoạn 3
          {
            orderIndex: 10,
            sentenceJp: '「一人焼肉」や「一人カラオケ」という言葉が流行しているのも、この流れをよく示しています。',
            sentenceVi: 'Sự thịnh hành của những từ như "Yakiniku một người" hay "Karaoke một người" cũng phản ánh rõ nét xu hướng này.',
            furigana: '「一[ひと]人[り]焼[やき]肉[にく]」や「一[ひと]人[り]カラオケ」という言[こと]葉[ば]が流[りゅう]行[こう]しているのも、この流[なが]れをよく示[しめ]しています。'
          },
          {
            orderIndex: 11,
            sentenceJp: '一人で食事をすることはもう珍しい日常になり、飲食店も一人客のためのメニューを別に作っています。',
            sentenceVi: 'Dùng bữa một mình đã trở thành chuyện thường nhật không còn hiếm thấy, và các nhà hàng quán ăn cũng soạn riêng thực đơn phục vụ khách đi lẻ.',
            furigana: '一[ひと]人[り]で食[しょく]事[じ]をすることはもう珍[めずら]しい日[にち]常[じょう]になり、飲[いん]食[しょく]店[てん]も一[ひと]人[り]客[きゃく]のためのメニューを別[べつ]に作[つく]っています。'
          },
          {
            orderIndex: 12,
            sentenceJp: '調査によると、若い世代の半数以上が一人で過ごす時間がどうしても必要だと答えており、一人で行う活動でストレスが解消されると話す人も多くいました。',
            sentenceVi: 'Theo điều tra, hơn một nửa thế hệ trẻ trả lời rằng thời gian ở một mình là điều nhất thiết phải có, và nhiều người chia sẻ rằng những hoạt động làm một mình giúp giải tỏa căng thẳng rất hiệu quả.',
            furigana: '調[ちょう]査[さ]によると、若[わか]い世[せ]代[だい]の半[はん]数[すう]以[い]上[じょう]が一[ひと]人[り]で過[す]ごす時[じ]間[かん]がどうしても必[ひつ]要[よう]だと答[こた]えており、一[ひと]人[り]で行[おこな]う活[かつ]動[どう]でストレスが解[かい]消[しょう]されると話[はな]す人[ひと]も多[おお]くいました。'
          },

          // Đoạn 4
          {
            orderIndex: 13,
            sentenceJp: 'こうした変化に合わせて、企業も素早く動いています。',
            sentenceVi: 'Hòa cùng những biến chuyển này, các doanh nghiệp cũng đang nhanh nhạy thích ứng.',
            furigana: 'こうした変[へん]化[か]に合[あ]わせて、企[き]業[ぎょう]も素[す]早[ばや]く動[うご]いています。'
          },
          {
            orderIndex: 14,
            sentenceJp: 'コンビニでは一人で食べやすいお弁当や小分けのおかずの種類が大きく増え、飲食店には一人用の席が用意され始めました。',
            sentenceVi: 'Tại các cửa hàng tiện lợi, các loại cơm hộp dễ ăn một mình hay các phần thức ăn chia nhỏ đã tăng mạnh, còn trong quán ăn thì chỗ ngồi cho một người cũng bắt đầu được bố trí.',
            furigana: 'コンビニでは一[ひと]人[り]で食[た]べやすいお弁[べん]当[とう]や小[こ]分[わ]けのおかずの種[しゅ]類[るい]が大[おお]きく増[ふ]え、飲[いん]食[しょく]店[てん]には一[ひと]人[り]用[よう]の席[せき]が用[よう]意[い]され始[はじ]めました。'
          },
          {
            orderIndex: 15,
            sentenceJp: '家電メーカーは小さな冷蔵庫や小型洗濯機のように単身世帯向けの製品を次々と発売しており、旅行会社では一人旅のための商品も販売しています。',
            sentenceVi: 'Các hãng điện máy liên tiếp tung ra các sản phẩm hướng đến người độc thân như tủ lạnh nhỏ hay máy giặt mini, còn các công ty lữ hành cũng mở bán các tour dành cho người du lịch một mình.',
            furigana: '家[か]電[でん]メーカーは小[ちい]さな冷[れい]蔵[ぞう]庫[こ]や小[こ]型[がた]洗[せん]濯[たく]機[き]のように単[たん]身[しん]世[せ]帯[たい]向[む]けの製[せい]品[ひん]を次[つぎ]々と発[はつ]売[ばい]しており、旅[りょ]行[こう]会[がい]社[しゃ]では一[ひと]人[り]旅[たび]のための商[しょう]品[ひん]も販[はん]売[ばい]しています。'
          },
          {
            orderIndex: 16,
            sentenceJp: '住宅市場でも小さなアパートやワンルームマンションを探す人が増え、小型住宅の価格が上がり続けています。',
            sentenceVi: 'Trên thị trường bất động sản, người tìm kiếm các căn hộ nhỏ hay chung cư 1 phòng cũng tăng lên, khiến giá nhà diện tích nhỏ liên tục leo thang.',
            furigana: '住[じゅう]宅[たく]市[し]場[じょう]でも小[ちい]さなアパートやワンルームマンションを探[さが]す人[ひと]が増[ふ]え、小[こ]型[がた]住[じゅう]宅[たく]の価[か]格[かく]が上[あ]がり続[つづ]けています。'
          },
          {
            orderIndex: 17,
            sentenceJp: '専門家たちは、単身世帯が消費市場の流れを変える最も重要な力になったと言います。',
            sentenceVi: 'Các chuyên gia nhận định rằng các hộ độc thân đã trở thành động lực quan trọng nhất làm thay đổi dòng chảy của thị trường tiêu dùng.',
            furigana: '専[せん]門[もん]家[か]たちは、単[たん]身[しん]世[せ]帯[たい]が消[しょう]費[ひ]市[し]場[じょう]の流[なが]れを変[か]える最[もっと]も重[じゅう]要[よう]な力[ちから]になったと言[い]います。'
          },

          // Đoạn 5
          {
            orderIndex: 18,
            sentenceJp: 'しかし、一人暮らしに明るい面だけがあるわけではありません。',
            sentenceVi: 'Tuy nhiên, cuộc sống một mình không phải chỉ toàn những mặt tươi sáng.',
            furigana: 'しかし、一[ひと]人[り]暮[ぐ]らしに明[あか]るい面[めん]だけがあるわけではありません。'
          },
          {
            orderIndex: 19,
            sentenceJp: '急に病気になったとき助けてくれる人がいないこと、年を取るほど大きくなる孤独感、そして経済的な不安は、単身世帯がよく語る悩みです。',
            sentenceVi: 'Không có người giúp đỡ khi đột ngột ốm đau, cảm giác cô đơn ngày một lớn theo tuổi tác, cùng nỗi bất an tài chính chính là những trăn trở mà người độc thân thường bộc bạch.',
            furigana: '急[きゅう]に病[びょう]気[き]になったとき助[たす]けてくれる人[ひと]がいないこと、年[とし]を取[と]るほど大[おお]きくなる孤[こ]独[どく]感[かん]、そして経[けい]済[ざい]的[てき]な不[ふ]安[あん]は、単[たん]身[しん]世[せ]帯[たい]がよく語[かた]る悩[なや]みです。'
          },
          {
            orderIndex: 20,
            sentenceJp: '特に一人暮らしの高齢者の場合、社会とのつながりが切れると、健康に問題が起きても誰も気づかないという危険な状況が生まれかねません。',
            sentenceVi: 'Đặc biệt ở người cao tuổi sống neo đơn, nếu mối liên kết xã hội bị cắt đứt thì rất có thể rơi vào tình cảnh nguy hiểm là khi sức khỏe có biến cố cũng chẳng ai hay biết.',
            furigana: '特[とく]に一[ひと]人[り]暮[ぐ]らしの高[こう]齢[れい]者[しゃ]の場[ば]合[あい]、社[しゃ]会[かい]とのつながりが切[き]れると、健[けん]康[こう]に問[もん]題[だい]が起[お]きても誰[だれ]も気[き]づかないという危[き]険[けん]な状[じょう]況[きょう]が生[う]まれかねません。'
          },
          {
            orderIndex: 21,
            sentenceJp: 'そのため政府は、単身世帯のための住宅支援や見守りサービス、孤独の問題を解決するための相談プログラムなど、さまざまな政策を準備しています。',
            sentenceVi: 'Chính vì thế, chính phủ đang chuẩn bị nhiều chính sách như hỗ trợ nhà ở, dịch vụ theo dõi bảo trợ người già, hay các chương trình tư vấn để giải quyết bài toán cô đơn.',
            furigana: 'そのため政[せい]府[ふ]は、単[たん]身[しん]世[せ]帯[たい]のための住[じゅう]宅[たく]支[し]援[えん]や見[み]守[まも]りサービス、孤[こ]独[どく]の問[もん]題[だい]を解[かい]決[けつ]するための相[そう]談[だん]プログラムなど、さまざまな政[せい]策[さく]を準[じゅん]備[び]しています。'
          },
          {
            orderIndex: 22,
            sentenceJp: 'しかし、まだ支援が足りないという指摘も多くあります。',
            sentenceVi: 'Thế nhưng, vẫn còn rất nhiều ý kiến chỉ ra rằng sự hỗ trợ này vẫn là chưa đủ.',
            furigana: 'しかし、まだ支[し]援[えん]が足[た]りないという指[し]摘[てき]も多[おお]くあります。'
          },

          // Đoạn 6
          {
            orderIndex: 23,
            sentenceJp: '専門家たちは、今後単身世帯が全世帯の半分近くを占めるようになると予測しています。',
            sentenceVi: 'Các chuyên gia dự đoán rằng trong tương lai, các hộ độc thân sẽ chiếm tới gần một nửa tổng số hộ gia đình.',
            furigana: '専[せん]門[もん]家[か]たちは、今[こん]後[ご]単[たん]身[しん]世[せ]帯[たい]が全[ぜん]世[せ]帯[たい]の半[はん]分[ぶん]近[ちか]くを占[し]めるようになると予[よ]測[そく]しています。'
          },
          {
            orderIndex: 24,
            sentenceJp: 'したがって、一人で暮らすことを個人の選択としてだけ見るのではなく、社会全体が単身者を支えるインフラを整え、新しいコミュニティの形を作っていくことが求められています。',
            sentenceVi: 'Do đó, thay vì chỉ xem việc sống một mình như một sự lựa chọn mang tính cá nhân, toàn xã hội cần hoàn thiện cơ sở hạ tầng nâng đỡ người sống độc thân và xây dựng những mô hình cộng đồng kiểu mới.',
            furigana: 'したがって、一[ひと]人[り]で暮[く]らすことを個[こ]人[じん]の選[せん]択[たく]としてだけ見[み]るのではなく、社[しゃ]会[かい]全[ぜん]体[たい]が単[たん]身[しん]者[しゃ]を支[ささ]えるインフラを整[ととの]え、新[あたら]しいコミュニティの形[かたち]を作[つく]っていくことが求[もと]められています。'
          }
        ]
      },
      vocabularies: {
        create: [
          { word: '変化', reading: 'へんか', hanViet: 'BIẾN HÓA', meaningVi: 'sự thay đổi', level: 'N3' },
          { word: '急速', reading: 'きゅうそく', hanViet: 'CẤP TỐC', meaningVi: 'nhanh chóng', level: 'N2' },
          { word: '統計', reading: 'とうけい', hanViet: 'THỐNG KÊ', meaningVi: 'thống kê', level: 'N3' },
          { word: '割合', reading: 'わりあい', hanViet: 'CÁT HỢP', meaningVi: 'tỷ lệ', level: 'N3' },
          { word: '見られる', reading: 'みられる', hanViet: 'KIẾN', meaningVi: 'được thấy, được dự đoán', level: 'N3' },
          { word: '特別な', reading: 'とくべつな', hanViet: 'ĐẶC BIỆT', meaningVi: 'đặc biệt', level: 'N4' },
          { word: '視線', reading: 'しせん', hanViet: 'THỊ TUYẾN', meaningVi: 'ánh nhìn', level: 'N2' },
          { word: '世代', reading: 'せだい', hanViet: 'THẾ ĐẠI', meaningVi: 'thế hệ', level: 'N3' },
          { word: 'むしろ', reading: 'むしろ', hanViet: null, meaningVi: 'trái lại, ngược lại', level: 'N3' },
          { word: '自然', reading: 'しぜん', hanViet: 'TỰ NHIÊN', meaningVi: 'tự nhiên', level: 'N4' },
          { word: '配偶者', reading: 'はいぐうしゃ', hanViet: 'PHỐI NGẪU GIẢ', meaningVi: 'vợ/chồng, bạn đời', level: 'N1' },
          { word: '価値観', reading: 'かちかん', hanViet: 'GIÁ TRỊ QUAN', meaningVi: 'hệ giá trị', level: 'N2' },
          { word: '自立', reading: 'じりつ', hanViet: 'TỰ LẬP', meaningVi: 'tự lập', level: 'N2' },
          { word: '小分け', reading: 'こわけ', hanViet: 'TIỂU PHÂN', meaningVi: 'chia nhỏ, khẩu phần nhỏ', level: 'N2' },
          { word: '孤独感', reading: 'こどくかん', hanViet: 'CÔ ĐỘC CẢM', meaningVi: 'cảm giác cô đơn', level: 'N2' }
        ]
      },
      grammars: {
        create: [
          {
            grammarPoint: '〜によって・〜による',
            level: 'N2',
            meaningVi: 'Do / Bằng cách / Theo',
            excerpt: '統計によると、全世帯のうち単身世帯が占める割合はすでに三分の一を超えており、今後も増え続けると見られています。'
          },
          {
            grammarPoint: '〜として(は)',
            level: 'N2',
            meaningVi: 'Với tư cách là / Coi như là',
            excerpt: '以前は一人で何かをする人を気の毒に思う視線が多かったのですが、最近の若い世代はむしろ一人だけの時間を楽しむことを自然な生活スタイルとして受け入れています。'
          },
          {
            grammarPoint: '〜につれて',
            level: 'N2',
            meaningVi: 'Càng... càng... / Cùng với sự thay đổi của...',
            excerpt: '平均寿命が延びるにつれて、配偶者を先に見送り、一人残される高齢者も多くなりました。'
          },
          {
            grammarPoint: '〜かねない',
            level: 'N2',
            meaningVi: 'Có nguy cơ dẫn đến hậu quả xấu',
            excerpt: '特に一人暮らしの高齢者の場合、社会とのつながりが切れると、健康に問題が起きても誰も気づかないという危険な状況が生まれかねません。'
          }
        ]
      },
      quizzes: {
        create: [
          {
            question: '最近の若い世代における「一人で過ごすこと」の受け止め方として、本文で述べられているものはどれか。',
            questionVi: 'Đâu là nhận định được nêu trong bài viết về thái độ của thế hệ trẻ ngày nay đối với việc "sống một mình / làm việc một mình"?',
            optionsJson: JSON.stringify([
              '1. 寂しくて耐えられないので、できるだけ避けたいと考えている。',
              '2. 以前と変わらず、他人の視線を恐れて隠れて行動している。',
              '3. むしろ自分だけの時間を楽しむ自然な生活スタイルとして肯定的に捉えている。',
              '4. 経済的な理由から仕方なく我慢している。'
            ]),
            optionsViJson: JSON.stringify([
              '1. Thấy cô đơn không thể chịu đựng nổi nên muốn né tránh tối đa.',
              '2. Vẫn như trước đây, luôn sợ hãi ánh mắt của người khác nên giấu giếm khi làm.',
              '3. Trái lại, đón nhận một cách tích cực như một phong cách sống tự nhiên để tận hưởng thời gian riêng của chính mình.',
              '4. Bị ép buộc phải chịu đựng do hoàn cảnh kinh tế khó khăn.'
            ]),
            correctIndex: 2,
            explanation: 'Đoạn 1 nêu rõ: "最近の若い世代はむしろ一人だけの時間を楽しむことを自然な生活スタイルとして受け入れています."',
            questionType: 'DETAIL_MATCH'
          },
          {
            question: '単身世帯が増加している理由として、本文で挙げられていないものはどれか。',
            questionVi: 'Đâu KHÔNG phải là nguyên nhân khiến số hộ độc thân gia tăng được nêu trong bài viết?',
            optionsJson: JSON.stringify([
              '1. 晩婚化や未婚化が進んだこと',
              '2. 会社が社員に一人暮らしを義務付けていること',
              '3. 平均寿命が延びて配偶者を亡くした高齢者が増えたこと',
              '4. 経済的に自立できる女性が増えたこと'
            ]),
            optionsViJson: JSON.stringify([
              '1. Xu hướng kết hôn muộn và không kết hôn ngày càng gia tăng.',
              '2. Công ty bắt buộc nhân viên phải sống một mình khi đi làm.',
              '3. Tuổi thọ bình quân tăng khiến số người cao tuổi mất bạn đời tăng lên.',
              '4. Phụ nữ ngày càng tự chủ và độc lập hơn về mặt kinh tế.'
            ]),
            correctIndex: 1,
            explanation: 'Đoạn 2 liệt kê các lý do: kết hôn muộn, tuổi thọ tăng, phụ nữ tự lập, coi trọng tự do cá nhân. Không hề có lý do công ty ép buộc.',
            questionType: 'DETAIL_MATCH'
          },
          {
            question: '企業の動きとして、本文の内容と合致しているものはどれか。',
            questionVi: 'Hành động nào của các doanh nghiệp sau đây phù hợp với nội dung bài viết?',
            optionsJson: JSON.stringify([
              '1. 一人客はお金を使わないため、ファミリー向けの商品に絞っている。',
              '2. 一人用の小型家電や小分けのおかず、一人旅向けの商品を次々と開発・販売している。',
              '3. 飲食店は一人客の入店を断るようになった。',
              '4. 大型マンションの需要が急増し、小型住宅の価格は下落している。'
            ]),
            optionsViJson: JSON.stringify([
              '1. Khách đơn thân không chi tiêu nhiều nên doanh nghiệp chỉ tập trung vào các mặt hàng cho gia đình.',
              '2. Doanh nghiệp liên tục phát triển và bán các thiết bị gia dụng mini, món ăn chia phần nhỏ và sản phẩm du lịch một mình.',
              '3. Các nhà hàng quán ăn bắt đầu từ chối tiếp nhận khách đi ăn một mình.',
              '4. Nhu cầu mua căn hộ lớn tăng vọt, trong khi giá nhà ở quy mô nhỏ liên tục sụt giảm.'
            ]),
            correctIndex: 1,
            explanation: 'Đoạn 4 nêu rõ: doanh nghiệp tung ra các sản phẩm như tủ lạnh nhỏ, máy giặt mini, đồ ăn chia nhỏ và tour du lịch 1 người.',
            questionType: 'DETAIL_MATCH'
          },
          {
            question: '一人暮らしの高齢者に関して、本文で最も懸念されている危険な状況とは何か。',
            questionVi: 'Liên quan đến người cao tuổi sống một mình, tình huống nguy hiểm nào được tác giả lo ngại nhất trong bài viết?',
            optionsJson: JSON.stringify([
              '1. 料理の腕が落ちて偏食になること',
              '2. 社会とのつながりが途切れ、健康に異変が起きても周囲が気づけないこと',
              '3. 小型家電の使い方が分からず困ること',
              '4. 旅行に行きすぎてお金を使い果たすこと'
            ]),
            optionsViJson: JSON.stringify([
              '1. Kỹ năng nấu ăn giảm sút dẫn đến thói quen ăn uống thiếu cân bằng dinh dưỡng.',
              '2. Mối liên hệ với xã hội bị cắt đứt, dẫn tới khi sức khỏe gặp biến cố không ai xung quanh phát hiện kịp thời.',
              '3. Gặp khó khăn vì không biết cách sử dụng các đồ điện gia dụng cỡ nhỏ.',
              '4. Đi du lịch quá nhiều dẫn đến tiêu hết tiền tiết kiệm.'
            ]),
            correctIndex: 1,
            explanation: 'Đoạn 5: "社会とのつながりが切れると、健康に問題が起きても誰も気づかないという危険な状況が生まれかねません."',
            questionType: 'REASON'
          },
          {
            question: 'この文章で筆者が最も主張したいことは何か。',
            questionVi: 'Điều mà tác giả muốn khẳng định và kêu gọi nhất qua bài viết này là gì?',
            optionsJson: JSON.stringify([
              '1. 一人暮らしは危険なので、全員結婚して同居すべきだ。',
              '2. 単身化は個人の自由な選択に任せ、社会は何の対策もする必要がない。',
              '3. 単身世帯の増加を個人の問題にとどめず、社会全体で支えるインフラと新しいコミュニティを構築すべきだ。',
              '4. 一人焼肉や一人カラオケの店舗をもっと増やすべきだ。'
            ]),
            optionsViJson: JSON.stringify([
              '1. Sống một mình rất nguy hiểm, vì vậy tất cả mọi người bắt buộc phải kết hôn và sống cùng nhau.',
              '2. Việc độc thân hóa là quyền tự do lựa chọn của mỗi cá nhân, xã hội không cần phải có biện pháp can thiệp nào.',
              '3. Không nên coi sự gia tăng hộ độc thân chỉ là chuyện của riêng mỗi cá nhân, mà toàn xã hội cần cùng nhau xây dựng hạ tầng hỗ trợ và kiến tạo các mô hình cộng đồng mới.',
              '4. Cần mở thêm thật nhiều cơ sở kinh doanh thịt nướng một người và karaoke một người.'
            ]),
            correctIndex: 2,
            explanation: 'Đoạn kết khẳng định: "一人で暮らすことを個人の選択としてだけ見るのではなく、社会全体が単身者を支えるインフラを整え、新しいコミュニティの形を作っていくことが求められています."',
            questionType: 'MAIN_IDEA'
          }
        ]
      }
    }
  });

  console.log('✅ [READING SEED] Successfully seeded authentic JLPT Dokkai demo article (1,261 chars)!');
}
