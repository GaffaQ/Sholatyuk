import axios from 'axios';

const BASE_URL = 'https://api.myquran.com/v2';

interface City {
  id: string;
  lokasi: string;
}

interface PrayerTimes {
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

interface RandomAyatResponse {
  status: boolean;
  data: {
    info: {
      surat: {
        id: number;
        nama: {
          ar: string;
          id: string;
        };
      };
    };
    ayat: {
      arab: string;
      text: string;
      ayah: string;
    };
  };
}

interface Quran {
  nomor: number;
  nama: string;
  nama_latin: string;
  jumlah_ayat: number;
  tempat_turun: string;
  arti: string;
  deskripsi: string;
  audio: string;
  ayat: Array<{
    id: number;
    surah: number;
    nomor: number;
    ar: string;
    tr: string;
    idn: string;
  }>;
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

// Fungsi untuk mendapatkan semua kota
export const getAllCities = async (): Promise<City[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/sholat/kota/semua`);
    if (response.data?.status === true && Array.isArray(response.data?.data)) {
      return response.data.data;
    }
    console.error('Invalid city data format:', response.data);
    return [];
  } catch (error) {
    console.error('Error getting cities:', error);
    return [];
  }
};

// Fungsi untuk mendapatkan jadwal sholat
export const getPrayerTimes = async (cityId: string): Promise<PrayerTimes | null> => {
  try {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    const response = await axios.get(
      `${BASE_URL}/sholat/jadwal/${cityId}/${year}-${month}-${day}`
    );

    if (response.data?.status === true && response.data?.data) {
      const jadwal = response.data.data;
      // Memastikan semua field yang diperlukan ada
      if (!jadwal.jadwal || !jadwal.id || !jadwal.lokasi) {
        console.error('Missing required fields in prayer times data:', jadwal);
        return null;
      }
      return jadwal;
    }
    console.error('Invalid prayer times data format:', response.data);
    return null;
  } catch (error) {
    console.error('Error getting prayer times:', error);
    return null;
  }
};

// Fungsi untuk mendapatkan ayat Al-Quran acak
export const getRandomSurah = async (): Promise<{
  nama_latin: string;
  ayat: {
    ar: string;
    idn: string;
    nomor: number;
  };
} | null> => {
  try {
    const response = await axios.get<RandomAyatResponse>(`${BASE_URL}/quran/ayat/acak`);
    
    if (response.data?.status === true && response.data?.data) {
      const { data } = response.data;
      
      if (!data.info?.surat?.nama?.id || !data.ayat?.arab || !data.ayat?.text || !data.ayat?.ayah) {
        console.error('Missing required fields in Quran data:', data);
        return null;
      }

      return {
        nama_latin: data.info.surat.nama.id,
        ayat: {
          ar: data.ayat.arab,
          idn: data.ayat.text,
          nomor: parseInt(data.ayat.ayah)
        }
      };
    }
    console.error('Invalid Quran data format:', response.data);
    return null;
  } catch (error) {
    console.error('Error getting random ayat:', error);
    return null;
  }
};

// Fungsi untuk mendapatkan lokasi pengguna menggunakan browser geolocation
export const getUserLocation = (): Promise<{ lat: number; lon: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation tidak didukung oleh browser Anda'));
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });
      },
      (error) => {
        reject(error);
      }
    );
  });
};

export const getRandomHadith = async (): Promise<HadithData> => {
  try {
    const response = await axios.get('https://api.myquran.com/v2/hadits/perawi/acak');
    return response.data;
  } catch (error) {
    console.error('Error fetching random hadith:', error);
    throw error;
  }
}; 