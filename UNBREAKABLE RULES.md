# RULES.md – Micro-App Architektur für hubb-nest

**1. Ordnerstruktur-Grundregeln**
- Jede Mini-App lebt in `/src/micro-apps/<appname>/`.
- Innerhalb jeder Mini-App mind. folgende Unterordner:  
  `/components/` – UI nur für diese Mini-App  
  `/hooks/` – nur für diese App  
  `/services/` – DB- und API-Logik nur für diese App  
  `/types/` – ggf. spez. Typen (alle globalen Typen in `/integrations/supabase/types.ts`)
- Gemeinsame UI-Elemente, Auth/Db-Client etc. immer nur aus `/components/ui/`, `/contexts/`, `/integrations/` ziehen.

**2. Datenzugriffe**
- Alle Mini-Apps nutzen den zentralen Supabase-Client: `/src/integrations/supabase/client.ts`.
- Jeder Datenzugriff MUSS `userId` des Auth-Kontexts beachten und übergeben.
- Datenmodell bleibt FLACH (keine verschachtelten Objekte/Arrays).

**3. Micro-App-Grenzen**
- Niemals direkte Imports von Komponenten, Hooks oder Services zwischen den Micro-Apps.
- Cross-App-Kommunikation nur über explizite zentrale Events/Shared Services.

**4. Dashboard & Widgets**
- Jede Mini-App bietet eine Hauptkomponente (`AppNameApp.tsx`), die im Dashboard als Widget rendert wird.
- Widget-Position und State werden im Backend-Layout mitgespeichert.

**5. Erweiterung**
- Neue Micro-Apps: immer eigenen Ordner, keine zentrale /src/pages Erweiterung!
- Existierende Micro-Apps dürfen zentralen Code nicht verändern.

**6. Reviews und Deployments**
- Mind. ein Code-Review vor Merge in „main“.
- Wenn KIs (Lovable etc.) Code generieren, immer gegen RULES.md und Dateistruktur checken.

**7. Micro-App Struktur & Import-Regeln**

- Jede Mini-App lebt in einem eigenen, isolierten Unterordner unter `/src/micro-apps/<appname>/` und folgt dabei einer konsistenten Struktur mit sinnvollen Unterordnern wie:  
  `/components/`, `/hooks/`, `/services/`, `/types/` (auch wenn einige am Anfang leer sind).  
- Gemeinsame Funktionen, Utilities, UI-Komponenten sowie zentrale Authentifizierung und Datenintegration dürfen **ausschließlich** aus den zentralen Shared-Ordnern importiert werden:  
  `/src/components/ui/`, `/src/contexts/`, `/src/integrations/`, `/src/lib/`.  
- Alles Spezifische, das nur zur jeweiligen Mini-App gehört (z. B. spezielle UI-Komponenten, State-Hooks, Datenservices), bleibt strikt ausschließlich im Mini-App-Ordner.  
- Code-Dopplungen sind zu vermeiden.  
- Globale Infrastruktur (Supabase-Client, AuthContext, zentrale UI-Bausteine) sind **nicht berührbar von Mini-Apps** und leben ausschließlich in den dedizierten zentralen Ordnern.  
- Direkte Importe von Komponenten, Hooks oder Services zwischen verschiedenen Micro-Apps sind **untersagt**.  
- Diese Regeln gelten gleichermaßen für menschliche Entwickler sowie KI-Tools (Lovable, Draftbit etc.), die Code generieren oder bearbeiten.  

**Begründung:**  
Diese Vorgaben sichern eine saubere Trennung von Verantwortlichkeiten, sorgen für Modularität, erleichtern Wartbarkeit und Skalierbarkeit sowie eine sichere und kontrollierte Weiterentwicklung der einzelnen Micro-Apps.
