import React, { useState, useEffect } from 'react'
import { getPrayerTimes, getRandomSurah, getAllCities, getRandomHadith } from './api'
import CitySelector from './components/CitySelector'
import PrayerCountdown from './components/PrayerCountdown'
import Footer from './components/Footer'

interface City {
  id: string;
  lokasi: string;
}

interface PrayerTimesData {
  id: string;
  lokasi: string;
  daerah: string;
  jadwal: {
    tanggal: string;
    imsak: string;
    subuh: string;
    terbit: string;
    dhuha: string;
    dzuhur: string;
    ashar: string;
    maghrib: string;
    isya: string;
  };
}

interface QuranData {
  nama_latin: string;
  ayat: {
    ar: string;
    idn: string;
    nomor: number;
  };
}

interface HadithData {
  status: boolean;
  request: {
    path: string;
  };
  info: {
    perawi: {
      name: string;
      slug: string;
      total: number;
    };
  };
  data: {
    number: number;
    arab: string;
    id: string;
  };
}

type ActiveView = 'prayer' | 'quran' | 'hadith';

function App() {
  const [date] = useState(new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }))

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedCity, setSelectedCity] = useState<City | null>(null)
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesData | null>(null)
  const [quranVerse, setQuranVerse] = useState<QuranData | null>(null)
  const [quranVerse2, setQuranVerse2] = useState<QuranData | null>(null)
  const [refreshingVerse, setRefreshingVerse] = useState(false)
  const [refreshingVerse2, setRefreshingVerse2] = useState(false)
  const [hadith, setHadith] = useState<HadithData | null>(null)
  const [refreshingHadith, setRefreshingHadith] = useState(false)
  const [activeView, setActiveView] = useState<ActiveView>('prayer');

  // Modifikasi useEffect untuk memuat dua ayat
  useEffect(() => {
    const loadSavedCity = async () => {
      const savedCity = localStorage.getItem('selectedCity');
      if (savedCity) {
        try {
          const city = JSON.parse(savedCity);
          await handleCitySelect(city, false);
        } catch (err) {
          console.error('Error loading saved city:', err);
          localStorage.removeItem('selectedCity');
        }
      }
    };

    loadSavedCity();
  }, []);

  const handleCitySelect = async (city: City, shouldSave: boolean = true) => {
    try {
      setLoading(true)
      setError(null)
      setSelectedCity(city)

      // Simpan pilihan kota ke localStorage jika diperlukan
      if (shouldSave) {
        localStorage.setItem('selectedCity', JSON.stringify(city));
      }

      // Mendapatkan jadwal sholat
      const [prayerData, quranData1, hadithData] = await Promise.all([
        getPrayerTimes(city.id),
        getRandomSurah(),
        getRandomHadith()
      ]);

      if (!prayerData || !prayerData.jadwal) {
        throw new Error('Gagal mendapatkan jadwal sholat')
      }
      setPrayerTimes(prayerData)
      setQuranVerse(quranData1)
      setHadith(hadithData)
    } catch (err) {
      console.error('Error:', err)
      setError(
        err instanceof Error 
          ? err.message 
          : 'Terjadi kesalahan saat memuat data. Silakan coba lagi.'
      )
      // Reset state jika terjadi error
      setPrayerTimes(null)
      setQuranVerse(null)
      setHadith(null)
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    if (selectedCity) {
      handleCitySelect(selectedCity)
    } else {
      setError(null)
    }
  }

  const handleChangeCity = () => {
    localStorage.removeItem('selectedCity'); // Hapus data kota dari localStorage
    setSelectedCity(null);
    setPrayerTimes(null);
    setQuranVerse(null);
    setQuranVerse2(null);
    setHadith(null);
    setError(null);
  }

  const handleRefreshVerse = async () => {
    try {
      setRefreshingVerse(true);
      const newQuranData = await getRandomSurah();
      if (!newQuranData) {
        throw new Error('Gagal mendapatkan ayat Al-Quran');
      }
      setQuranVerse(newQuranData);
    } catch (err) {
      console.error('Error refreshing verse:', err);
    } finally {
      setRefreshingVerse(false);
    }
  };

  const handleRefreshVerse2 = async () => {
    try {
      setRefreshingVerse2(true);
      const newQuranData = await getRandomSurah();
      if (!newQuranData) {
        throw new Error('Gagal mendapatkan ayat Al-Quran');
      }
      setQuranVerse2(newQuranData);
    } catch (err) {
      console.error('Error refreshing verse:', err);
    } finally {
      setRefreshingVerse2(false);
    }
  };

  const handleRefreshHadith = async () => {
    try {
      setRefreshingHadith(true);
      const newHadithData = await getRandomHadith();
      if (!newHadithData) {
        throw new Error('Gagal mendapatkan hadist');
      }
      setHadith(newHadithData);
    } catch (err) {
      console.error('Error refreshing hadith:', err);
    } finally {
      setRefreshingHadith(false);
    }
  };

  if (!selectedCity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 relative overflow-hidden flex flex-col">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/4 w-1/2 h-1/2 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-1/2 -right-1/4 w-1/2 h-1/2 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 bg-indigo-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="flex-1 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
            <CitySelector onCitySelect={handleCitySelect} />
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-50 to-dark-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-400 mx-auto"></div>
          <p className="mt-4 text-gray-300">Memuat data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-50 to-dark-100">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <div className="space-x-4">
            <button 
              onClick={handleRetry}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Coba Lagi
            </button>
            <button 
              onClick={handleChangeCity}
              className="px-4 py-2 bg-dark-300 text-gray-300 rounded-lg hover:bg-dark-400 transition-colors"
            >
              Pilih Kota Lain
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!prayerTimes?.jadwal || !quranVerse?.ayat) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-50 to-dark-100">
        <div className="text-center text-red-400">
          <p>Data tidak tersedia</p>
          <button 
            onClick={handleChangeCity}
            className="mt-4 px-4 py-2 bg-dark-300 rounded-lg hover:bg-dark-400 transition-colors"
          >
            Pilih Kota Lain
          </button>
        </div>
      </div>
    )
  }

  const prayerTimesToShow = {
    subuh: prayerTimes.jadwal.subuh || '-',
    dhuha: prayerTimes.jadwal.dhuha || '-',
    dzuhur: prayerTimes.jadwal.dzuhur || '-',
    ashar: prayerTimes.jadwal.ashar || '-',
    maghrib: prayerTimes.jadwal.maghrib || '-',
    isya: prayerTimes.jadwal.isya || '-'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 relative overflow-hidden flex flex-col">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/4 w-1/2 h-1/2 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-1/2 -right-1/4 w-1/2 h-1/2 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 bg-indigo-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="flex-1 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          {/* Header */}
          <header className="text-center mb-8 relative">
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
              <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white via-blue-400 to-purple-500 text-transparent bg-clip-text mb-6 tracking-tight">
              Sholatyuk
            </h1>
            
            <p className="text-gray-400 mb-8">Temukan waktu sholat tepat untuk daerahmu</p>
            
            {/* Location and Date info in one line */}
            <div className="glass-pill mb-6 inline-flex items-center justify-center space-x-4 bg-gray-700/30 backdrop-blur-2xl py-3 px-4 rounded-2xl sm:shadow-2xl hover:-translate-y-1 transition border border-gray-600 hover:border-blue-400">
              <div className="flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-lg text-gray-100">{selectedCity.lokasi}</p>
              </div>
              <div className="w-px h-6 bg-gray-600"></div>
              <div className="flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-lg text-gray-100">{date}</p>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex justify-center space-x-4 mb-8">
              <button 
                onClick={handleChangeCity}
                className="px-6 py-2 text-sm bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300 text-white flex items-center space-x-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                <span>Ganti Kota</span>
              </button>
            </div>

            {/* View Selection Button Group */}
            <div className="flex justify-center space-x-2 mb-8">
              <button
                onClick={() => setActiveView('prayer')}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2
                  ${activeView === 'prayer' 
                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30' 
                    : 'bg-gray-800/40 text-gray-300 hover:bg-gray-700/40'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Jadwal Sholat</span>
              </button>
              <button
                onClick={() => setActiveView('quran')}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2
                  ${activeView === 'quran' 
                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30' 
                    : 'bg-gray-800/40 text-gray-300 hover:bg-gray-700/40'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span>Ayat Al-Quran</span>
              </button>
              <button
                onClick={() => setActiveView('hadith')}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2
                  ${activeView === 'hadith' 
                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30' 
                    : 'bg-gray-800/40 text-gray-300 hover:bg-gray-700/40'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span>Hadist</span>
              </button>
            </div>
          </header>

          <div className="space-y-8">
            {/* Prayer Times Section */}
            {activeView === 'prayer' && (
              <div className="max-w-3xl mx-auto card bg-gray-800/40 backdrop-blur-xl py-2 px-3 rounded-2xl sm:shadow-2xl hover:-translate-y-1 transition border border-gray-700/50 hover:border-blue-500/50">
                <h2 className="card-title text-lg mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Waktu Sholat Hari Ini</span>
                </h2>
                
                <div className="mb-4">
                  <PrayerCountdown prayerTimes={prayerTimesToShow} />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.entries(prayerTimesToShow).map(([prayer, time]) => (
                    <div key={prayer} className="prayer-time-item bg-gray-800/40 backdrop-blur-xl py-2 px-3 rounded-2xl sm:shadow-2xl hover:-translate-y-1 transition border border-gray-700/50 hover:border-purple-500/50">
                      <h3 className="text-base font-medium text-gray-300 mb-1">
                        {prayer.charAt(0).toUpperCase() + prayer.slice(1)}
                      </h3>
                      <p className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text">{time}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quran Verse Section */}
            {activeView === 'quran' && (
              <div className="max-w-3xl mx-auto card bg-gray-800/40 backdrop-blur-xl py-2 px-3 rounded-2xl sm:shadow-2xl hover:-translate-y-1 transition border border-gray-700/50 hover:border-purple-500/50">
                <h2 className="card-title text-lg mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Ayat Al-Quran Acak
                  <button 
                    onClick={handleRefreshVerse}
                    disabled={refreshingVerse}
                    className={`ml-auto px-2 py-1 text-sm rounded-lg transition-all duration-300 flex items-center space-x-1
                      ${refreshingVerse 
                        ? 'bg-gray-600 cursor-not-allowed' 
                        : 'bg-dark-300 hover:bg-dark-400 text-gray-300'}`}
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className={`h-4 w-4 ${refreshingVerse ? 'animate-spin' : ''}`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>{refreshingVerse ? 'Memuat...' : 'Acak'}</span>
                  </button>
                </h2>
                <div className="bg-gray-900/30 rounded-xl p-4 border border-gray-700/30">
                  {refreshingVerse ? (
                    <div className="flex flex-col items-center justify-center py-6">
                      <div className="animate-pulse flex space-x-4">
                        <div className="flex-1 space-y-3 py-1">
                          <div className="h-3 bg-dark-400/50 rounded w-3/4"></div>
                          <div className="space-y-2">
                            <div className="h-3 bg-dark-400/50 rounded"></div>
                            <div className="h-3 bg-dark-400/50 rounded w-5/6"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-2xl font-arabic leading-loose text-gray-100 text-right mb-4">
                        {quranVerse?.ayat.ar}
                      </p>
                      <p className="text-base text-gray-300 italic">
                        {quranVerse?.ayat.idn}
                      </p>
                      <div className="mt-3 pt-3 border-t border-dark-400">
                        <p className="text-sm text-purple-400">
                          QS. {quranVerse?.nama_latin} : {quranVerse?.ayat.nomor}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Hadith Section */}
            {activeView === 'hadith' && (
              <div className="max-w-3xl mx-auto card bg-gray-800/40 backdrop-blur-xl py-2 px-3 rounded-2xl sm:shadow-2xl hover:-translate-y-1 transition border border-gray-700/50 hover:border-purple-500/50">
                <h2 className="card-title text-lg mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Hadist Acak
                  <button 
                    onClick={handleRefreshHadith}
                    disabled={refreshingHadith}
                    className={`ml-auto px-2 py-1 text-sm rounded-lg transition-all duration-300 flex items-center space-x-1
                      ${refreshingHadith 
                        ? 'bg-gray-600 cursor-not-allowed' 
                        : 'bg-dark-300 hover:bg-dark-400 text-gray-300'}`}
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className={`h-4 w-4 ${refreshingHadith ? 'animate-spin' : ''}`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>{refreshingHadith ? 'Memuat...' : 'Acak'}</span>
                  </button>
                </h2>
                <div className="bg-gray-900/30 rounded-xl p-4 border border-gray-700/30">
                  {refreshingHadith ? (
                    <div className="flex flex-col items-center justify-center py-6">
                      <div className="animate-pulse flex space-x-4">
                        <div className="flex-1 space-y-3 py-1">
                          <div className="h-3 bg-dark-400/50 rounded w-3/4"></div>
                          <div className="space-y-2">
                            <div className="h-3 bg-dark-400/50 rounded"></div>
                            <div className="h-3 bg-dark-400/50 rounded w-5/6"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-2xl font-arabic leading-loose text-gray-100 text-right mb-4">
                        {hadith?.data.arab}
                      </p>
                      <p className="text-base text-gray-300 italic">
                        {hadith?.data.id}
                      </p>
                      <div className="mt-3 pt-3 border-t border-dark-400">
                        <p className="text-sm text-purple-400">
                          HR. {hadith?.info.perawi.name} No. {hadith?.data.number}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default App 