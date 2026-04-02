"use client";

import { Scale, ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">
              Haklarım
            </span>
          </Link>
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Ana Sayfa
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900">Kullanım Koşulları</h1>
            <p className="text-sm text-slate-500">Son güncelleme: 2 Nisan 2026</p>
          </div>
        </div>

        <div className="prose prose-slate max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">1. Hizmet Tanımı</h2>
            <p className="text-slate-600 leading-relaxed">
              Haklarım, yapay zeka destekli hukuki analiz ve bilgilendirme platformudur. Platform,
              kullanıcıların hukuki durumlarını analiz etmelerine, emsal kararlara erişmelerine ve avukat
              bulmalarına yardımcı olur.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-3">
              <p className="text-sm text-amber-800 font-semibold">
                Haklarım bir hukuk bürosu değildir ve avukatlık hizmeti vermez. Platform tarafından
                sunulan analizler ve öneriler yalnızca bilgilendirme amaçlıdır ve profesyonel hukuki
                danışmanlığın yerini almaz.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">2. Hesap Oluşturma ve Sorumluluklar</h2>
            <ul className="list-disc list-inside text-slate-600 space-y-1">
              <li>Platformu kullanmak için 18 yaşından büyük olmanız gerekmektedir</li>
              <li>Kayıt sırasında doğru ve güncel bilgiler vermelisiniz</li>
              <li>Hesap güvenliğinizden siz sorumlusunuz; şifrenizi kimseyle paylaşmayın</li>
              <li>Avukat hesabı açmak için geçerli bir baro sicil numarası gereklidir</li>
              <li>Sahte veya yanıltıcı bilgi veren hesaplar askıya alınır</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">3. Hizmet Kullanım Kuralları</h2>
            <p className="text-slate-600 leading-relaxed">Aşağıdaki davranışlar yasaktır:</p>
            <ul className="list-disc list-inside text-slate-600 space-y-1 mt-2">
              <li>Platformu yasa dışı amaçlarla kullanmak</li>
              <li>Otomatik botlar veya scriptler ile aşırı istek göndermek</li>
              <li>Başka kullanıcıların verilerine yetkisiz erişim girişimi</li>
              <li>Yanıltıcı veya sahte dava bilgileri girmek</li>
              <li>Platformun güvenlik önlemlerini atlatmaya çalışmak</li>
              <li>Avukat olmadan avukat hesabı açmak</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">4. AI Analiz Hizmeti</h2>
            <ul className="list-disc list-inside text-slate-600 space-y-1">
              <li>AI analizleri istatistiksel olasılıklara dayanır ve kesin sonuç garantisi vermez</li>
              <li>Kazanma olasılığı tahmini, benzer davalara dayalı bir yaklaşımdır</li>
              <li>Her hukuki durum kendine özgüdür; analiz sonuçları genel niteliktedir</li>
              <li>Önemli hukuki kararlar vermeden önce mutlaka bir avukata danışın</li>
              <li>Ücretsiz plan aylık 3 analiz hakkı sunar; Pro plan sınırsız analiz içerir</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">5. Avukat-Müvekkil İletişimi</h2>
            <p className="text-slate-600 leading-relaxed">
              Platform üzerindeki mesajlaşma hizmeti avukat-müvekkil iletişimini kolaylaştırmak içindir.
              Ancak platform üzerinden yapılan iletişim, resmi bir avukatlık sözleşmesi oluşturmaz.
              Avukat-müvekkil ilişkisi için tarafların ayrıca yazılı sözleşme imzalaması gerekmektedir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">6. Ödeme ve İade</h2>
            <ul className="list-disc list-inside text-slate-600 space-y-1">
              <li>Pro abonelik ödemeleri iyzico altyapısı üzerinden güvenli şekilde işlenir</li>
              <li>Aylık abonelikler otomatik olarak yenilenir</li>
              <li>İptal işlemi mevcut dönemin sonunda geçerli olur</li>
              <li>İlk 7 gün içinde memnun kalmazsanız tam iade yapılır</li>
              <li>7 günden sonra kalan süre için orantılı iade yapılabilir</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">7. Fikri Mülkiyet</h2>
            <p className="text-slate-600 leading-relaxed">
              Platform tasarımı, kodu, logosu ve içeriği Haklarım&apos;ın fikri mülkiyetidir.
              Kullanıcılar tarafından girilen dava bilgileri ve belgeler kullanıcıya aittir.
              AI tarafından üretilen analiz raporları kullanıcının kişisel kullanımı içindir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">8. Sorumluluk Sınırlaması</h2>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm text-red-800 leading-relaxed">
                Haklarım, AI analiz sonuçlarının doğruluğu, eksiksizliği veya uygunluğu konusunda
                hiçbir garanti vermez. Platform tarafından sunulan bilgilere dayanarak alınan kararlarda
                oluşabilecek zararlardan Haklarım sorumlu tutulamaz. Hukuki kararlarınız için mutlaka
                lisanslı bir avukata danışmanız önerilir.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">9. Hesap Askıya Alma ve Fesih</h2>
            <p className="text-slate-600 leading-relaxed">
              Kullanım koşullarını ihlal eden hesaplar önceden bildirim yapılmaksızın askıya alınabilir veya
              silinebilir. Hesabınızı istediğiniz zaman Ayarlar sayfasından silebilirsiniz.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">10. Değişiklikler</h2>
            <p className="text-slate-600 leading-relaxed">
              Bu kullanım koşullarını önceden bildirmeksizin güncelleme hakkımız saklıdır.
              Önemli değişiklikler e-posta ile bildirilir. Platformu kullanmaya devam etmeniz,
              güncel koşulları kabul ettiğiniz anlamına gelir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">11. Uygulanacak Hukuk</h2>
            <p className="text-slate-600 leading-relaxed">
              Bu koşullar Türkiye Cumhuriyeti kanunlarına tabidir. Uyuşmazlıklarda İstanbul Mahkemeleri
              ve İcra Daireleri yetkilidir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">12. İletişim</h2>
            <p className="text-slate-600">
              <strong>E-posta:</strong> info@haklarim.app<br />
              <strong>Adres:</strong> Haklarım Teknoloji A.Ş., İstanbul, Türkiye
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
