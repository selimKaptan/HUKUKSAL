"use client";

import { Scale, ArrowLeft, Lock } from "lucide-react";
import Link from "next/link";

export default function KVKKPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">
              Justice<span className="text-blue-600">Guard</span>
            </span>
          </Link>
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Ana Sayfa
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
            <Lock className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900">KVKK Aydınlatma Metni</h1>
            <p className="text-sm text-slate-500">6698 Sayılı Kişisel Verilerin Korunması Kanunu</p>
          </div>
        </div>

        <div className="prose prose-slate max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">1. Veri Sorumlusu</h2>
            <p className="text-slate-600 leading-relaxed">
              6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) uyarınca, kişisel verileriniz
              veri sorumlusu sıfatıyla <strong>JusticeGuard Teknoloji A.Ş.</strong> tarafından aşağıda
              açıklanan kapsamda işlenecektir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">2. İşlenen Kişisel Veriler</h2>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm mt-3">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-200 px-4 py-2 text-left font-semibold text-slate-700">Veri Kategorisi</th>
                    <th className="border border-slate-200 px-4 py-2 text-left font-semibold text-slate-700">Veriler</th>
                  </tr>
                </thead>
                <tbody className="text-slate-600">
                  <tr>
                    <td className="border border-slate-200 px-4 py-2 font-medium">Kimlik Bilgileri</td>
                    <td className="border border-slate-200 px-4 py-2">Ad, soyad, e-posta adresi</td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="border border-slate-200 px-4 py-2 font-medium">Mesleki Bilgiler</td>
                    <td className="border border-slate-200 px-4 py-2">Baro sicil no, uzmanlık alanı, deneyim (avukatlar için)</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-200 px-4 py-2 font-medium">İletişim Bilgileri</td>
                    <td className="border border-slate-200 px-4 py-2">Telefon numarası, mesajlaşma içerikleri</td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="border border-slate-200 px-4 py-2 font-medium">Hukuki İşlem Bilgileri</td>
                    <td className="border border-slate-200 px-4 py-2">Dava özetleri, analiz sonuçları, yüklenen belgeler</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-200 px-4 py-2 font-medium">İşlem Güvenliği</td>
                    <td className="border border-slate-200 px-4 py-2">IP adresi, oturum bilgileri, erişim logları</td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="border border-slate-200 px-4 py-2 font-medium">Finansal Bilgiler</td>
                    <td className="border border-slate-200 px-4 py-2">Ödeme işlem kayıtları (kart bilgileri saklanmaz)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">3. İşleme Amaçları</h2>
            <ul className="list-disc list-inside text-slate-600 space-y-1">
              <li>Hukuki analiz hizmetinin yerine getirilmesi</li>
              <li>Avukat-müvekkil eşleştirme ve iletişim hizmetlerinin sunulması</li>
              <li>Üyelik işlemlerinin yürütülmesi</li>
              <li>Ödeme işlemlerinin gerçekleştirilmesi</li>
              <li>Hizmet kalitesinin artırılması ve istatistiksel analizler</li>
              <li>Bilgi güvenliği süreçlerinin yürütülmesi</li>
              <li>Yasal yükümlülüklerin yerine getirilmesi</li>
              <li>Hukuki uyuşmazlıkların çözümlenmesi</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">4. Hukuki Sebepler</h2>
            <p className="text-slate-600 leading-relaxed">
              Kişisel verileriniz KVKK md. 5/2 kapsamında aşağıdaki hukuki sebeplere dayanılarak işlenmektedir:
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-1 mt-2">
              <li><strong>(a)</strong> Kanunlarda açıkça öngörülmesi</li>
              <li><strong>(c)</strong> Sözleşmenin kurulması veya ifası için gerekli olması</li>
              <li><strong>(ç)</strong> Veri sorumlusunun hukuki yükümlülüğünü yerine getirmesi</li>
              <li><strong>(f)</strong> Meşru menfaatimiz için zorunlu olması</li>
            </ul>
            <p className="text-slate-600 leading-relaxed mt-2">
              AI analiz hizmeti ve avukat eşleştirme için <strong>açık rızanız</strong> alınmaktadır.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">5. Verilerin Aktarılması</h2>

            <h3 className="text-lg font-semibold text-slate-800 mb-2">5.1 Yurt İçi Aktarım</h3>
            <ul className="list-disc list-inside text-slate-600 space-y-1">
              <li>iyzico Ödeme Hizmetleri A.Ş. (ödeme işlemleri)</li>
              <li>Yasal merciler (mahkeme kararı ile talep halinde)</li>
            </ul>

            <h3 className="text-lg font-semibold text-slate-800 mb-2 mt-4">5.2 Yurt Dışı Aktarım</h3>
            <ul className="list-disc list-inside text-slate-600 space-y-1">
              <li><strong>Anthropic, Inc. (ABD):</strong> Dava özetleri AI analizi için işlenir. KVKK md. 9 kapsamında açık rızanız alınır.</li>
              <li><strong>Supabase, Inc. (ABD):</strong> Veritabanı altyapısı. Veriler şifreli olarak saklanır.</li>
            </ul>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-3">
              <p className="text-sm text-blue-800">
                Yurt dışına veri aktarımı, yalnızca hizmetin sunulması için zorunlu hallerde ve açık rızanız
                dahilinde gerçekleştirilir. Aktarım yapılan firmalar yeterli veri koruma taahhütleri sunmaktadır.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">6. Veri Sahibi Hakları (KVKK md. 11)</h2>
            <p className="text-slate-600 leading-relaxed">
              KVKK&apos;nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mt-3 space-y-2">
              <p className="text-sm text-slate-700"><strong>a)</strong> Kişisel verilerinizin işlenip işlenmediğini öğrenme</p>
              <p className="text-sm text-slate-700"><strong>b)</strong> İşlenmişse buna ilişkin bilgi talep etme</p>
              <p className="text-sm text-slate-700"><strong>c)</strong> İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</p>
              <p className="text-sm text-slate-700"><strong>ç)</strong> Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</p>
              <p className="text-sm text-slate-700"><strong>d)</strong> Eksik veya yanlış işlenmişse düzeltilmesini isteme</p>
              <p className="text-sm text-slate-700"><strong>e)</strong> KVKK md. 7 kapsamında silinmesini veya yok edilmesini isteme</p>
              <p className="text-sm text-slate-700"><strong>f)</strong> Düzeltme/silme işlemlerinin aktarılan üçüncü kişilere bildirilmesini isteme</p>
              <p className="text-sm text-slate-700"><strong>g)</strong> Münhasıran otomatik sistemler vasıtasıyla analiz edilmesi sonucu aleyhine bir sonuç çıkmasına itiraz etme</p>
              <p className="text-sm text-slate-700"><strong>ğ)</strong> Kanuna aykırı işlenmesi sebebiyle zarara uğraması halinde zararın giderilmesini talep etme</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">7. Başvuru Yöntemi</h2>
            <p className="text-slate-600 leading-relaxed">
              Yukarıdaki haklarınızı kullanmak için aşağıdaki yöntemlerle başvurabilirsiniz:
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-1 mt-2">
              <li><strong>E-posta:</strong> kvkk@justiceguard.com.tr (kayıtlı e-posta adresinizden)</li>
              <li><strong>Posta:</strong> JusticeGuard Teknoloji A.Ş., İstanbul, Türkiye</li>
              <li><strong>Platform:</strong> Ayarlar &gt; Hesabımı Sil (veri silme talebi)</li>
            </ul>
            <p className="text-slate-600 leading-relaxed mt-3">
              Başvurularınız en geç <strong>30 gün</strong> içinde ücretsiz olarak sonuçlandırılır.
              İşlemin ayrıca bir maliyet gerektirmesi halinde Kişisel Verileri Koruma Kurulu
              tarafından belirlenen tarife uygulanır.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">8. Veri Güvenliği Tedbirleri</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <h4 className="text-sm font-bold text-emerald-800 mb-2">Teknik Tedbirler</h4>
                <ul className="text-xs text-emerald-700 space-y-1">
                  <li>SSL/TLS şifreleme</li>
                  <li>Veritabanı seviyesinde RLS</li>
                  <li>API rate limiting ve CSRF koruması</li>
                  <li>Güvenlik header&apos;ları (CSP, HSTS)</li>
                  <li>Parola hash&apos;leme</li>
                </ul>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h4 className="text-sm font-bold text-blue-800 mb-2">İdari Tedbirler</h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>Erişim yetki kontrolü</li>
                  <li>Veri işleme envanteri</li>
                  <li>Çalışan gizlilik taahhütleri</li>
                  <li>Düzenli güvenlik denetimleri</li>
                  <li>Veri ihlali bildirim prosedürü</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
