import { useId, useState, type ReactNode } from "react";
import { Button as RACButton, DropZone, FileTrigger, Text as RACText } from "react-aria-components";
import { Text } from "../primitives/Text";
import { useMessages } from "../i18n/I18nProvider";

/**
 * FileDropzone: choose files by dragging them in or with a button, so it works without a mouse. The app decides what to do
 * with the files (`onFiles`); this only collects them. State what is allowed up front (`accept`, `description`), and show
 * progress and errors in the app next to the file name. Never rely on the file type alone: check on the server.
 *
 * @example
 * <FileDropzone label="Upload a scan report" accept={["application/json"]} onFiles={(files) => upload(files)} />
 */
export function FileDropzone({ label, description, accept, multiple = true, onFiles, error, children }: {
  label: string; description?: ReactNode; /** MIME types or extensions, for example [".csv", "image/png"]. */ accept?: string[];
  multiple?: boolean; onFiles: (files: File[]) => void; error?: ReactNode; children?: ReactNode;
}) {
  const { t } = useMessages();
  const id = useId();
  const [over, setOver] = useState(false);
  const take = async (items: { kind: string; getFile?: () => Promise<File> }[]) => {
    const files = await Promise.all(items.filter((i) => i.kind === "file" && i.getFile).map((i) => i.getFile!()));
    const ok = accept?.length ? files.filter((f) => accept.some((a) => (a.startsWith(".") ? f.name.toLowerCase().endsWith(a.toLowerCase()) : a.endsWith("/*") ? f.type.startsWith(a.slice(0, -1)) : f.type === a))) : files;
    if (ok.length) onFiles(multiple ? ok : ok.slice(0, 1));
  };
  return (
    <div className="pr-drop-wrap">
      <DropZone className="pr-drop" data-over={over || undefined} aria-labelledby={id} onDropEnter={() => setOver(true)} onDropExit={() => setOver(false)} onDrop={(e) => { setOver(false); void take(e.items as never); }}>
        <RACText slot="label" id={id} className="pr-drop__label">{label}</RACText>
        <Text size="2" color="gray">{t("dropzone.dragHere")}</Text>
        <FileTrigger acceptedFileTypes={accept} allowsMultiple={multiple} onSelect={(list) => { if (list) onFiles(Array.from(list)); }}>
          <RACButton className="pr-btn" data-variant="outline" data-size="2">{multiple ? t("dropzone.chooseFiles") : t("dropzone.chooseFile")}</RACButton>
        </FileTrigger>
        {description && <Text size="1" color="gray">{description}</Text>}
      </DropZone>
      {error && <p role="alert" className="pr-error">{error}</p>}
      {children}
    </div>
  );
}
