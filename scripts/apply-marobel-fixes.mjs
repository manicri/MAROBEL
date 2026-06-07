import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const write = (path, value) => fs.writeFileSync(path, value);
const mustReplace = (source, search, replacement, label) => {
  const result = source.replace(search, replacement);
  if (result === source) throw new Error(`No se pudo aplicar: ${label}`);
  return result;
};

let admin = read('src/components/AdminDashboard.tsx');
admin = admin.replace("  const [isBlocking, setIsBlocking] = useState(false);\n  const [blockTime, setBlockTime] = useState('09:00');\n", '');
admin = mustReplace(
  admin,
  /  const handleImageUpload = async \(e: React\.ChangeEvent<HTMLInputElement>\) => \{[\s\S]*?\n  \};\n\n  const fetchAppointments/,
  `  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Selecciona un archivo de imagen valido');
      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no puede superar los 5 MB');
      e.target.value = '';
      return;
    }

    setIsUploadingImage(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        throw new Error('Debes iniciar sesion como administrador antes de subir imagenes');
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const filePath = \`${'${authData.user.id}'}/${'${crypto.randomUUID()}'}.${'${fileExt}'}\`;
      const { error: uploadError } = await supabase.storage
        .from('servicios-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('servicios-images').getPublicUrl(filePath);
      setCurrentService(prev => ({ ...prev, imagen_url: data.publicUrl }));
      toast.success('Imagen subida correctamente');
    } catch (error: any) {
      const message = error?.message || 'Error desconocido';
      const storageError = /row-level security|policy|bucket/i.test(message);
      toast.error(storageError
        ? 'Supabase rechazo la imagen. Ejecuta supabase-storage-fix.sql.'
        : \`Error al subir imagen: ${'${message}'}\`);
      console.error(error);
    } finally {
      setIsUploadingImage(false);
      e.target.value = '';
    }
  };

  const fetchAppointments`,
  'subida de imagen'
);
admin = admin.replace(/\n  const handleBlockTime = async \(isFullDay: boolean = false\) => \{[\s\S]*?\n  \};\n\n  const handleSaveService/, '\n  const handleSaveService');
admin = mustReplace(
  admin,
  /<div className="flex items-center gap-4">\s*(\{currentService\.imagen_url[\s\S]*?\{isUploadingImage && <span[\s\S]*?<\/span>\})\s*<\/div>/,
  `<div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                          $1
                        </div>
                        <Input
                          type="url"
                          value={currentService.imagen_url || ''}
                          onChange={(e) => setCurrentService({ ...currentService, imagen_url: e.target.value })}
                          className="bg-white border-none h-12 rounded-xl"
                          placeholder="O pega aqui la URL publica de una imagen"
                        />
                        <p className="text-[10px] text-[#5D4037]/45">
                          Formatos permitidos: JPG, PNG o WebP. Tamano maximo: 5 MB.
                        </p>`,
  'campo URL de imagen'
);
admin = mustReplace(
  admin,
  /\n\s*<div className="pt-4 border-t border-\[#E5D3B3\]\/10">\s*<label[^>]*>Bloquear Horario<\/label>[\s\S]*?\* Esto marcará el horario o día como no disponible para los clientes\.\s*<\/p>\s*<\/div>/,
  '',
  'bloqueador duplicado'
);
write('src/components/AdminDashboard.tsx', admin);

let calendar = read('src/components/Calendar.tsx');
calendar = mustReplace(
  calendar,
  /\n  useEffect\(\(\) => \{/,
  `
  const handleAdminBlockDay = async () => {
    if (!isAdmin || isFullDayBlocked) return;

    const { error } = await supabase.from('bloqueos').insert({
      fecha: selectedDate,
      hora: null,
      motivo: 'Bloqueo administrativo de dia completo'
    });

    if (error) {
      toast.error(\`Error al bloquear el dia: ${'${error.message}'}\`);
      console.error(error);
      return;
    }

    toast.success('Dia completo bloqueado');
    refreshAvailability();
  };

  useEffect(() => {`,
  'bloquear dia desde calendario'
);
calendar = mustReplace(
  calendar,
  '<div className="grid grid-cols-3 sm:grid-cols-5 gap-3">',
  `<div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
      {isAdmin && !isFullDayBlocked && hours.length > 0 && (
        <button
          type="button"
          onClick={handleAdminBlockDay}
          className="col-span-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-red-700 hover:bg-red-100"
        >
          Bloquear dia completo
        </button>
      )}`,
  'boton de dia completo'
);
write('src/components/Calendar.tsx', calendar);

let services = read('src/components/Services.tsx');
services = services.replace('import { useSelection } from "../context/SelectionContext";\n', '');
services = services.replace('  const { addService } = useSelection();\n', '');
services = mustReplace(
  services,
  /\n\s*\{\/\* Servicios más solicitados \*\/\}[\s\S]*?(?=\n\s*\{\/\* Confianza y Prueba Social \*\/\})/,
  '\n',
  'retirar favoritos de portada'
);
write('src/components/Services.tsx', services);

let category = read('src/pages/CategoriaPage.tsx');
category = category.replace("import { ServiceSidebar } from '../components/ServiceSidebar';\n", "import { ServiceSidebar } from '../components/ServiceSidebar';\nimport PopularServices from '../components/PopularServices';\n");
category = category.replace('<a href="/#reservas"', '<Link to="/reserva"').replace('</a>\n          </div>', '</Link>\n          </div>');
category = mustReplace(category, '        </div>\n      </div>\n      <FloatingReservationButton />', '        </div>\n        <PopularServices />\n      </div>\n      <FloatingReservationButton />', 'favoritos en categorias');
write('src/pages/CategoriaPage.tsx', category);

fs.rmSync('scripts/apply-marobel-fixes.mjs');
fs.rmSync('.github/workflows/apply-marobel-fixes.yml');
