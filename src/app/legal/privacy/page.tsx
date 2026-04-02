"use client";

import { Scale, ArrowLeft, Shield } from "lucide-react";
import Link from "next/link";

export default function PrivacyPolicyPage() {
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
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900">Gizlilik Politikası</h1>
            <p className="text-sm text-slate-500">Son güncelleme: 2 Nisan 2026</p>
          </div>
        </div>

        <div className="prose prose-slate max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">1. Genel Bakış</h2>
            <p className="text-slate-600 leading-relaxed">
              Haklarım (&quot;Platform&quot;, &quot;Biz&quot;), kullanıcılarının gizliliğine saygı duyar ve kişisel verilerin korunmasını
              en yüksek öncelik olarak kabul eder. Bu Gizlilik Politikası, platformumuzu kullandığınızda hangi verilerin
              toplandığını, nasıl kullanıldığını ve korunduğunu açıklamaktadır.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">2. Toplanan Veriler</h2>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">2.1 Hesap Bilgileri</h3>
            <ul className="list-disc list-inside text-slate-600 space-y-1">
              <li>Ad ve soyad</li>
              <li>E-posta adresi</li>
              <li>Şifrelenmiş parola</li>
              <li>Kullanıcı rolü (müvekkil veya avukat)</li>
            </ul>

            <h3 className="text-lg font-semibold text-slate-800 mb-2 mt-4">2.2 Avukat Profil Bilgileri</h3>
            <ul className="list-disc list-inside text-slate-600 space-y-1">
              <li>Baro sicil numarası</li>
              <li>Baro kaydı ve şehir bilgisi</li>
              <li>Uzmanlık alanları ve deneyim süresi</li>
              <li>İletişim bilgileri (telefon)</li>
            </ul>

            <h3 className="text-lg font-semibold text-slate-800 mb-2 mt-4">2.3 Dava Analiz Verileri</h3>
            <ul className="list-disc list-inside text-slate-600 space-y-1">
              <li>Olay özetleri ve ek notlar</li>
              <li>Dava kategorisi</li>
              <li>AI analiz sonuçları ve öneriler</li>
              <li>Yüklenen belgeler (varsa)</li>
            </ul>

            <h3 className="text-lg font-semibold text-slate-800 mb-2 mt-4">2.4 Teknik Veriler</h3>
            <ul className="list-disc list-inside text-slate-600 space-y-1">
              <li>IP adresi (rate limiting amaçlı, anonim)</li>
              <li>Tarayıcı tipi ve sürümü</li>
              <li>Sayfa ziyaret istatistikleri</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">3. Verilerin Kullanım Amaçları</h2>
            <ul className="list-disc list-inside text-slate-600 space-y-1">
              <li>Hukuki analiz hizmetinin sunulması</li>
              <li>Avukat-müvekkil eşleştirmesi ve iletişim</li>
              <li>Hesap güvenliğinin sağlanması</li>
              <li>Platform performansının iyileştirilmesi</li>
              <li>Yasal yükümlülüklerin yerine getirilmesi</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">4. Verilerin Paylaşımı</h2>
            <p className="text-slate-600 leading-relaxed">
              Kişisel verilerinizi üçüncü taraflarla <strong>satmaz veya kiralamayız</strong>. Verileriniz yalnızca
              aşağıdaki durumlarda paylaşılabilir:
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-1 mt-2">
              <li><strong>AI Analiz:</strong> Dava özetleri, analiz için Anthropic (Claude AI) sunucularına gönderilir. Bu veriler Anthropic tarafından model eğitiminde kullanılmaz.</li>
              <li><strong>Ödeme İşlemleri:</strong> Ödeme bilgileri iyzico altyapısı üzerinden işlenir; kart bilgileri sunucularımızda saklanmaz.</li>
              <li><strong>Yasal Zorunluluk:</strong> Mahkeme kararı veya yasal düzenleme gereği talep edilmesi halinde.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">5. Veri Güvenliği</h2>
            <ul className="list-disc list-inside text-slate-600 space-y-1">
              <li>Tüm iletişim SSL/TLS şifreleme ile korunur</li>
              <li>Parolalar hash algoritması ile saklanır (Supabase Auth)</li>
              <li>Veritabanı erişimi Row Level Security (RLS) ile kısıtlanmıştır</li>
              <li>API endpoint&apos;leri rate limiting ve CSRF korumasına sahiptir</li>
              <li>Güvenlik header&apos;ları (CSP, HSTS, X-Frame-Options) aktiftir</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">6. Veri Saklama Süresi</h2>
            <p className="text-slate-600 leading-relaxed">
              Hesap bilgileriniz hesabınız aktif olduğu sürece saklanır. Hesabınızı sildiğinizde tüm kişisel
              verileriniz 30 gün içinde kalıcı olarak silinir. Dava analiz verileri, hesap silindikten sonra
              anonim hale getirilerek istatistiksel amaçlarla saklanabilir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">7. Çerezler (Cookies)</h2>
            <p className="text-slate-600 leading-relaxed">
              Platformumuz yalnızca oturum yönetimi için gerekli teknik çerezleri kullanır.
              Reklam veya takip amaçlı üçüncü taraf çerezleri kullanılmaz.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">8. Haklarınız</h2>
            <p className="text-slate-600 leading-relaxed">
              6698 sayılı KVKK kapsamında aşağıdaki haklara sahipsiniz:
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-1 mt-2">
              <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
              <li>İşlenmişse buna ilişkin bilgi talep etme</li>
              <li>Verilerin düzeltilmesini veya silinmesini isteme</li>
              <li>İşlemenin kısıtlanmasını talep etme</li>
              <li>Veri taşınabilirliği hakkı</li>
              <li>Otomatik karar alma süreçlerine itiraz etme</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">9. İletişim</h2>
            <p className="text-slate-600 leading-relaxed">
              Gizlilik politikamızla ilgili sorularınız için bizimle iletişime geçebilirsiniz:
            </p>
            <p className="text-slate-600 mt-2">
              <strong>E-posta:</strong> privacy@haklarim.app<br />
              <strong>Adres:</strong> Haklarım Teknoloji A.Ş., İstanbul, Türkiye
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
