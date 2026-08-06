import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Loader2, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface LocationInputProps {
  value: string;
  onChange: (address: string, lat?: number, lng?: number) => void;
  placeholder?: string;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    road?: string;
    suburb?: string;
    city?: string;
    town?: string;
    state?: string;
    postcode?: string;
  };
}

export default function LocationInput({
  value,
  onChange,
  placeholder = 'Digite o endereço ou CEP do estabelecimento'
}: LocationInputProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedSuccess, setSelectedSuccess] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sincroniza estado local com a prop externa se mudar fora
  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handler de Busca por CEP (ViaCEP API)
  const buscarPorCep = async (cepLimpo: string) => {
    try {
      setIsLoading(true);
      const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await res.json();
      if (!data.erro) {
        const enderecoFormatado = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`;
        setQuery(enderecoFormatado);
        
        // Busca coordenadas GPS aproximadas via Nominatim para o endereço do CEP
        const nominatimRes = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&countrycodes=br&limit=1&q=${encodeURIComponent(enderecoFormatado)}`
        );
        const nominatimData = await nominatimRes.json();
        let lat: number | undefined;
        let lng: number | undefined;

        if (nominatimData && nominatimData.length > 0) {
          lat = parseFloat(nominatimData[0].lat);
          lng = parseFloat(nominatimData[0].lon);
        }

        onChange(enderecoFormatado, lat, lng);
        setSelectedSuccess(true);
        setTimeout(() => setSelectedSuccess(false), 2000);
        setIsDropdownOpen(false);
      }
    } catch (err) {
      console.error('Erro ao consultar ViaCEP:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce para busca por texto no OpenStreetMap (Nominatim API)
  useEffect(() => {
    const textTrim = query.trim();

    // Checa se é um CEP (8 dígitos numéricos)
    const cepDigits = textTrim.replace(/\D/g, '');
    if (cepDigits.length === 8) {
      buscarPorCep(cepDigits);
      return;
    }

    if (textTrim.length < 3) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&countrycodes=br&addressdetails=1&limit=5&q=${encodeURIComponent(textTrim)}`,
          {
            headers: {
              'Accept-Language': 'pt-BR,pt;q=0.9',
            }
          }
        );
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data || []);
          setIsDropdownOpen(true);
        }
      } catch (err) {
        console.error('Erro ao buscar no Nominatim:', err);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectSuggestion = (item: NominatimResult) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    const displayStr = item.display_name;

    setQuery(displayStr);
    onChange(displayStr, lat, lng);
    setIsDropdownOpen(false);
    setSelectedSuccess(true);
    setTimeout(() => setSelectedSuccess(false), 2000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value;
    setQuery(newText);
    onChange(newText);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative flex items-center">
        <div className="absolute left-4 opacity-50 pointer-events-none">
          {isLoading ? (
            <Loader2 size={18} className="animate-spin text-emerald-400" />
          ) : selectedSuccess ? (
            <Check size={18} className="text-emerald-400" />
          ) : (
            <MapPin size={18} />
          )}
        </div>

        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => { if (suggestions.length > 0) setIsDropdownOpen(true); }}
          placeholder={placeholder}
          className={`w-full h-12 pl-11 pr-10 border rounded-2xl text-xs font-medium focus:outline-none transition-all ${
            isDark 
              ? 'bg-[#1c1c20] border-white/[0.08] text-white focus:border-emerald-500/50' 
              : 'bg-neutral-100 border-neutral-300 text-black focus:border-emerald-600'
          }`}
        />

        <div className="absolute right-3 opacity-40 pointer-events-none">
          <Search size={16} />
        </div>
      </div>

      {/* Dropdown com sugestões de endereço do OpenStreetMap / Brasil */}
      {isDropdownOpen && suggestions.length > 0 && (
        <div className={`absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl border shadow-2xl overflow-hidden backdrop-blur-xl transition-all ${
          isDark ? 'bg-[#18181c]/95 border-white/10 text-white' : 'bg-white/95 border-neutral-200 text-black'
        }`}>
          <div className="p-2 border-b border-white/10 text-[10px] font-bold uppercase tracking-wider opacity-50 px-3">
            Sugestões de Endereço (Brasil)
          </div>

          <ul className="max-h-60 overflow-y-auto divide-y divide-white/5 text-xs">
            {suggestions.map((item) => (
              <li
                key={item.place_id}
                onClick={() => handleSelectSuggestion(item)}
                className={`p-3 cursor-pointer flex items-start gap-2.5 transition-colors ${
                  isDark ? 'hover:bg-white/10' : 'hover:bg-neutral-100'
                }`}
              >
                <MapPin size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-xs leading-snug">{item.display_name}</p>
                  <p className="text-[10px] opacity-50 mt-0.5">Lat: {item.lat} | Lng: {item.lon}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
