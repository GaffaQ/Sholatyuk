import React, { useState, useEffect, useRef } from 'react';
import { format, parse, differenceInMinutes, differenceInSeconds, addMinutes } from 'date-fns';
import { id } from 'date-fns/locale';

interface PrayerTimes {
  [key: string]: string;
}

interface PrayerCountdownProps {
  prayerTimes: PrayerTimes;
}

interface LastAdzanTime {
  prayer: string;
  time: string;
  startedAt: string;
  prayerTime: string;
}

const PrayerCountdown: React.FC<PrayerCountdownProps> = ({ prayerTimes }) => {
  const [timeUntilNextPrayer, setTimeUntilNextPrayer] = useState<string>('');
  const [nextPrayer, setNextPrayer] = useState<string>('');
  const [isAdzan, setIsAdzan] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Inisialisasi audio
    audioRef.current = new Audio('./src/sound/adzan.mp3');
    audioRef.current.addEventListener('ended', () => {
      audioRef.current?.pause();
      audioRef.current!.currentTime = 0;
    });

    // Reset audio dan cek status adzan untuk kota baru
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // Cek apakah waktu sholat di kota baru sesuai dengan lastAdzan
    const lastAdzanStr = localStorage.getItem('lastAdzan');
    if (lastAdzanStr) {
      const lastAdzan: LastAdzanTime = JSON.parse(lastAdzanStr);
      const currentPrayerTime = prayerTimes[lastAdzan.prayer];
      
      // Jika waktu sholat berbeda dengan yang tersimpan, reset status adzan
      if (currentPrayerTime !== lastAdzan.prayerTime) {
        setIsAdzan(false);
        localStorage.removeItem('lastAdzan');
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('ended', () => {});
      }
    };
  }, [prayerTimes]);

  const checkLastAdzan = () => {
    const lastAdzanStr = localStorage.getItem('lastAdzan');
    if (!lastAdzanStr) return false;

    const lastAdzan: LastAdzanTime = JSON.parse(lastAdzanStr);
    
    // Cek apakah waktu sholat sesuai dengan kota saat ini
    const currentPrayerTime = prayerTimes[lastAdzan.prayer];
    if (currentPrayerTime !== lastAdzan.prayerTime) {
      return false;
    }

    const lastAdzanTime = parse(lastAdzan.startedAt, 'yyyy-MM-dd HH:mm:ss', new Date());
    const currentTime = new Date();
    const diffInMinutes = differenceInMinutes(currentTime, lastAdzanTime);

    if (diffInMinutes >= 0 && diffInMinutes < 5) {
      // Jika dalam rentang 5 menit, mulai audio dari posisi yang sesuai
      if (audioRef.current) {
        const diffInSeconds = differenceInSeconds(currentTime, lastAdzanTime);
        audioRef.current.currentTime = diffInSeconds;
        audioRef.current.play().catch(err => console.error('Error playing audio:', err));
      }
      return true;
    }

    return false;
  };

  const saveLastAdzan = (prayer: string, time: string) => {
    const lastAdzan: LastAdzanTime = {
      prayer,
      time,
      startedAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      prayerTime: prayerTimes[prayer] // Simpan waktu sholat saat ini
    };
    localStorage.setItem('lastAdzan', JSON.stringify(lastAdzan));
  };

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const currentTime = format(now, 'HH:mm');
      
      // Cek apakah masih dalam rentang waktu adzan (5 menit)
      if (checkLastAdzan()) {
        const lastAdzan: LastAdzanTime = JSON.parse(localStorage.getItem('lastAdzan') || '{}');
        setNextPrayer(lastAdzan.prayer);
        setTimeUntilNextPrayer('Adzan Berkumandang');
        setIsAdzan(true);
        return;
      }

      let nextPrayerTime = '';
      let nextPrayerName = '';
      let shortestDiff = Infinity;

      Object.entries(prayerTimes).forEach(([prayer, time]) => {
        const prayerTime = parse(time, 'HH:mm', now);
        const currentDateTime = parse(currentTime, 'HH:mm', now);
        
        if (prayerTime < currentDateTime) {
          prayerTime.setDate(prayerTime.getDate() + 1);
        }

        const diff = differenceInMinutes(prayerTime, currentDateTime);
        
        if (diff < shortestDiff && diff >= 0) {
          shortestDiff = diff;
          nextPrayerTime = time;
          nextPrayerName = prayer;
        }
      });

      // Jika tepat waktu adzan
      if (shortestDiff === 0) {
        saveLastAdzan(nextPrayerName, nextPrayerTime);
        setTimeUntilNextPrayer('Adzan Berkumandang');
        setIsAdzan(true);
        // Mulai pemutaran audio
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(err => console.error('Error playing audio:', err));
        }
      } else {
        setIsAdzan(false);
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        const hours = Math.floor(shortestDiff / 60);
        const minutes = shortestDiff % 60;
        const timeString = hours > 0 
          ? `${hours} jam ${minutes} menit lagi`
          : `${minutes} menit lagi`;
        
        setTimeUntilNextPrayer(timeString);
      }

      setNextPrayer(nextPrayerName);
    };

    // Update setiap detik
    const interval = setInterval(updateCountdown, 1000);
    updateCountdown(); // Initial call

    return () => {
      clearInterval(interval);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [prayerTimes]);

  return (
    <div className={`text-center p-4 rounded-xl ${isAdzan ? 'bg-green-500/20' : 'bg-gray-800/40'} border border-gray-700/50 hover:border-purple-500/50 backdrop-blur-xl transition-all duration-300`}>
      <h3 className="text-lg font-medium text-gray-300 mb-2">
        {isAdzan ? 'Waktu Sholat' : 'Menuju Waktu Sholat'}
      </h3>
      <div className="flex flex-col items-center">
        <p className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text mb-1">
          {nextPrayer.charAt(0).toUpperCase() + nextPrayer.slice(1)}
        </p>
        <p className={`text-lg ${isAdzan ? 'text-green-400 animate-pulse font-bold' : 'text-gray-400'}`}>
          {timeUntilNextPrayer}
        </p>
      </div>
    </div>
  );
};

export default PrayerCountdown; 