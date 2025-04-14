import React, { useEffect, useState } from 'react';

interface AttachmentProps {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
}

const Attachment: React.FC<AttachmentProps> = ({ label, onChange, value, className }) => {
    const [image, setImage] = useState<string | ArrayBuffer | null>(null);

    useEffect(() => {
        if (value) { setImage(value) }
    }, [value])

    // Función para comprimir y redimensionar la imagen con compresión agresiva
    const compressImage = (file: File, maxWidth: number = 400, maxHeight: number = 300, quality: number = 0.5): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    // Calcular las dimensiones manteniendo la proporción
                    let width = img.width;
                    let height = img.height;
                    
                    // Reducción más agresiva del tamaño
                    if (width > height) {
                        if (width > maxWidth) {
                            height = Math.round(height * maxWidth / width);
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width = Math.round(width * maxHeight / height);
                            height = maxHeight;
                        }
                    }
                    
                    // Crear un canvas para redimensionar
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    
                    // Dibujar la imagen redimensionada
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);
                    
                    // Convertir a JPEG con baja calidad para máxima compresión
                    // Forzar a JPEG independientemente del tipo original
                    const dataUrl = canvas.toDataURL('image/jpeg', quality);
                    
                    // Verificar tamaño aproximado en bytes
                    const base64Data = dataUrl.split(',')[1];
                    const sizeInBytes = Math.ceil((base64Data.length * 3) / 4);
                    const sizeInKB = sizeInBytes / 1024;
                    
                    console.log(`Imagen comprimida: ${sizeInKB.toFixed(2)}KB`);
                    
                    // Si aún es demasiado grande, comprimir más
                    if (sizeInKB > 100) {
                        // Reducir aún más la calidad o el tamaño
                        const secondCanvas = document.createElement('canvas');
                        const newWidth = Math.floor(width * 0.7);
                        const newHeight = Math.floor(height * 0.7);
                        
                        secondCanvas.width = newWidth;
                        secondCanvas.height = newHeight;
                        
                        const ctx2 = secondCanvas.getContext('2d');
                        ctx2?.drawImage(img, 0, 0, newWidth, newHeight);
                        
                        // Usar calidad aún más baja
                        const secondDataUrl = secondCanvas.toDataURL('image/jpeg', 0.3);
                        resolve(secondDataUrl);
                    } else {
                        resolve(dataUrl);
                    }
                };
                img.onerror = (error) => reject(error);
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            try {
                // Verificar tamaño original
                const fileSizeInMB = file.size / (1024 * 1024);
                console.log(`Tamaño original de la imagen: ${fileSizeInMB.toFixed(2)}MB`);
                
                if (fileSizeInMB > 5) {
                    alert(`La imagen es demasiado grande (${fileSizeInMB.toFixed(2)}MB). Se recomienda usar imágenes de menos de 5MB.`);
                }
                
                // Comprimir y redimensionar la imagen
                const compressedImage = await compressImage(file);
                
                // Calcular tamaño aproximado después de la compresión
                const base64Data = compressedImage.split(',')[1];
                const sizeInBytes = Math.ceil((base64Data.length * 3) / 4);
                const sizeInKB = sizeInBytes / 1024;
                
                console.log(`Tamaño después de la compresión: ${sizeInKB.toFixed(2)}KB`);
                
                if (sizeInKB > 500) {
                    alert(`La imagen sigue siendo demasiado grande después de la compresión (${(sizeInKB/1024).toFixed(2)}MB). Por favor, utilice una imagen más pequeña.`);
                    return;
                }
                
                // Actualizar la vista previa
                setImage(compressedImage);
                
                // Enviar el valor comprimido
                onChange({
                    ...e,
                    target: {
                        ...e.target,
                        value: compressedImage, // Base 64 img comprimida
                    },
                });
            } catch (error) {
                console.error('Error al procesar la imagen:', error);
                alert('Error al procesar la imagen. Intente con otra imagen.');
            }
        } else {
            alert('Por favor, seleccione un archivo de imagen válido');
        }
    };

    return (
        <div className={`attachment-container ${className}`}>
            <label className="attachment-label cd-pt-2 cd-font-medium cd-block cd-text-lg cd-font-sans ">{label}</label>
            <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className=" cd-text-gray-900 dark:cd-text-gray-200 cd-font-sans cd-mt-1 cd-block cd-w-full cd-px-3 cd-py-2 dark:cd-bg-zinc-700 cd-border cd-border-gray-300 dark:cd-border-gray-500 cd-rounded-md cd-shadow-sm focus:cd-outline-none focus:cd-ring-indigo"
            />

            {image && (
                <div className="image-preview cd-flex cd-justify-center cd-items-center cd-mt-2">
                    <img src={image as string} alt="Preview" className="cd-mt-2 cd-w-20 cd-h-20" />

                </div>
            )}

        </div>
    );
};

export default Attachment;