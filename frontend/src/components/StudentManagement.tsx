import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useUserManagement } from '../hooks/useUsers'
import './AdminPanel.css' // Reusing styles for now

interface UserData {
    email: string
    password: string
    full_name: string
    cohort: string
}

interface ErrorDetail {
    email: string
    error: string
}

interface ProcessedItem {
    email: string
    status: 'success' | 'error'
    message: string
}

interface Results {
    success: number
    errors: number
    errorDetails: ErrorDetail[]
    processed: ProcessedItem[]
    failedUsers?: UserData[]
}

interface StudentManagementProps {
    centerId?: string
    centerName?: string
}

// TODOS los usuarios del archivo CSV del Colegio IPDC
const usersData: UserData[] = [
    // IPDC1
    { email: 'pdc-01180137@colegiosingles.com', password: 'ingles2025', full_name: 'ENRIQUE RAMOS VALERIO', cohort: 'IPDC1' },
    { email: 'pdc-09170434@colegiosingles.com', password: 'ingles2025', full_name: 'MAXIMO TADEO FARIAS SANCHEZ', cohort: 'IPDC1' },
    { email: 'pdc-08231416@colegiosingles.com', password: 'ingles2025', full_name: 'FABIAN SAEZ ESCOBAR', cohort: 'IPDC1' },
    { email: 'pdc-09170273@colegiosingles.com', password: 'ingles2025', full_name: 'ERIKA ORTIZ RIOJAS', cohort: 'IPDC1' },
    { email: 'pdc-09210775@colegiosingles.com', password: 'ingles2025', full_name: 'PABLO SANTIAGO FARIAS LOZANO', cohort: 'IPDC1' },
    { email: 'pdc-09170171@colegiosingles.com', password: 'ingles2025', full_name: 'MIA AMELIE RAMIREZ HERMANN', cohort: 'IPDC1' },
    { email: 'pdc-01231206@colegiosingles.com', password: 'ingles2025', full_name: 'REGINA IGLESIAS SOLANO', cohort: 'IPDC1' },
    { email: 'pdc-03231298@colegiosingles.com', password: 'ingles2025', full_name: 'DENISSE DANIELA CHAVEZ LOPEZ', cohort: 'IPDC1' },
    { email: 'pdc-02231227@colegiosingles.com', password: 'ingles2025', full_name: 'ROSA VICTORIA PEREZ FAUTRÉ', cohort: 'IPDC1' },
    { email: 'pdc-07231395@colegiosingles.com', password: 'ingles2025', full_name: 'EMILIANO VALLEJO FLORES', cohort: 'IPDC1' },
    { email: 'pdc-08200600@colegiosingles.com', password: 'ingles2025', full_name: 'JUAN PABLO GUEVARA LORIA', cohort: 'IPDC1' },
    { email: 'pdc-09170246@colegiosingles.com', password: 'ingles2025', full_name: 'MARIA FERNANDA ACEVEDO SALCEDO', cohort: 'IPDC1' },
    { email: 'pdc-09170430@colegiosingles.com', password: 'ingles2025', full_name: 'YUMA MÖSL RÖCK', cohort: 'IPDC1' },
    { email: 'pdc-09170466@colegiosingles.com', password: 'ingles2025', full_name: 'FLOR DE LIZ BETANCOURT CONTRERAS', cohort: 'IPDC1' },
    { email: 'pdc-02251722@colegiosingles.com', password: 'ingles2025', full_name: 'ABIGAIL MEDINA GUZMAN', cohort: 'IPDC1' },
    { email: 'pdc-08221117@colegiosingles.com', password: 'ingles2025', full_name: 'MARIA FERNANDA ARCE RUIZ CABAÑAS', cohort: 'IPDC1' },
    { email: 'pdc-09170448@colegiosingles.com', password: 'ingles2025', full_name: 'ELENA SOPHIA CHABLE BUHLER', cohort: 'IPDC1' },
    { email: 'pdc-03241497@colegiosingles.com', password: 'ingles2025', full_name: 'DAVID SANTIAGO SANCHEZ BADILLO', cohort: 'IPDC1' },
    { email: 'pdc-09170326@colegiosingles.com', password: 'ingles2025', full_name: 'ILEANA ORTIZ SALDAÑA', cohort: 'IPDC1' },
    { email: 'pdc-02220889@colegiosingles.com', password: 'ingles2025', full_name: 'MATEO MONROY ROMERO', cohort: 'IPDC1' },
    { email: 'pdc-09170354@colegiosingles.com', password: 'ingles2025', full_name: 'DANIEL MULEIRO VAZQUEZ', cohort: 'IPDC1' },
    { email: 'pdc-09170355@colegiosingles.com', password: 'ingles2025', full_name: 'RAFAEL MULEIRO VAZQUEZ', cohort: 'IPDC1' },
    { email: 'pdc-09170439@colegiosingles.com', password: 'ingles2025', full_name: 'XIMENA GOMEZ BERMUDEZ', cohort: 'IPDC1' },
    { email: 'pdc-07221064@colegiosingles.com', password: 'ingles2025', full_name: 'LEONARDO RIEBELING ABDOUL NOUR', cohort: 'IPDC1' },
    { email: 'pdc-09170403@colegiosingles.com', password: 'ingles2025', full_name: 'EDUARDO MORENTIN AGUIRRE', cohort: 'IPDC1' },
    { email: 'pdc-09170452@colegiosingles.com', password: 'ingles2025', full_name: 'NICOLAS GARCIA VIVES', cohort: 'IPDC1' },
    { email: 'pdc-09170186@colegiosingles.com', password: 'ingles2025', full_name: 'LUCAS DE CARVALHO CABALLERO', cohort: 'IPDC1' },
    { email: 'pdc-09231430@colegiosingles.com', password: 'ingles2025', full_name: 'MARIA YATZIL GOMEZ COLLI', cohort: 'IPDC1' },
    { email: 'pdc-02220880@colegiosingles.com', password: 'ingles2025', full_name: 'IVANA SOFIA SERRANO BARRERA', cohort: 'IPDC1' },
    { email: 'pdc-02251735@colegiosingles.com', password: 'ingles2025', full_name: 'BEULAH CAMILA VARGAS SUAREZ', cohort: 'IPDC1' },
    { email: 'pdc-08190524@colegiosingles.com', password: 'ingles2025', full_name: 'EMILIA VIERA PELLAT', cohort: 'IPDC1' },
    { email: 'pdc-09170572@colegiosingles.com', password: 'ingles2025', full_name: 'CAMILA VICTORIA OSTBERG', cohort: 'IPDC1' },
    { email: 'pdc-09170188@colegiosingles.com', password: 'ingles2025', full_name: 'VALESKA HERRERA ALBARRAN', cohort: 'IPDC1' },
    { email: 'pdc-03231286@colegiosingles.com', password: 'ingles2025', full_name: 'MARIA JULIETA SANTILLAN ADAMES', cohort: 'IPDC1' },
    { email: 'tul-05230315@colegiosingles.com', password: 'ingles2025', full_name: 'THIAGO PETER MORAN MORAN', cohort: 'IPDC1' },
    { email: 'pdc-02251752@colegiosingles.com', password: 'ingles2025', full_name: 'JULIAN OMAR ZAPATA AGNEL', cohort: 'IPDC1' },
    { email: 'pdc-09170185@colegiosingles.com', password: 'ingles2025', full_name: 'ERICK MANUEL OBERDORFER RONQUILLO', cohort: 'IPDC1' },
    { email: 'pdc-03251755@colegiosingles.com', password: 'ingles2025', full_name: 'ALLAN SANTIAGO REGALADO ALVAREZ', cohort: 'IPDC1' },
    { email: 'pdc-03251757@colegiosingles.com', password: 'ingles2025', full_name: 'XIMENA LABASTIDA SERFATY', cohort: 'IPDC1' },
    { email: 'pdc-03251760@colegiosingles.com', password: 'ingles2025', full_name: 'ULYSSES ANDRES PARRA CASTILLO', cohort: 'IPDC1' },
    { email: 'pdc-07221080@colegiosingles.com', password: 'ingles2025', full_name: 'CAMILA DANAE NEGRETE GONZALEZ', cohort: 'IPDC1' },
    { email: 'pdc-02200564@colegiosingles.com', password: 'ingles2025', full_name: 'MIA ISSABELLA OCHOA JUAREZ', cohort: 'IPDC1' },
    { email: 'pdc-04251784@colegiosingles.com', password: 'ingles2025', full_name: 'JUAN PABLO ACUÑA BONEQUI', cohort: 'IPDC1' },
    { email: 'pdc-05251814@colegiosingles.com', password: 'ingles2025', full_name: 'LEONARDO MENDEZ MUELA', cohort: 'IPDC1' },
    { email: 'pdc-06251823@colegiosingles.com', password: 'ingles2025', full_name: 'GORKI LEE OROZCO', cohort: 'IPDC1' },
    { email: 'pdc-08241651@colegiosingles.com', password: 'ingles2025', full_name: 'MARIANNE GOMEZ RAMIREZ', cohort: 'IPDC1' },
    { email: 'pdc-07251855@colegiosingles.com', password: 'ingles2025', full_name: 'MAIKA SILVERIO MARENCO GARCIA', cohort: 'IPDC1' },
    { email: 'pdc-12210842@colegiosingles.com', password: 'ingles2025', full_name: 'MAXWELL POWELL MEEKS', cohort: 'IPDC1' },
    { email: 'pdc-07251859@colegiosingles.com', password: 'ingles2025', full_name: 'MAXIMO LUCIO GOMEZ MONRROY', cohort: 'IPDC1' },
    { email: 'pdc-07251867@colegiosingles.com', password: 'ingles2025', full_name: 'DANIELA NICOL MARTINEZ SILVA', cohort: 'IPDC1' },
    { email: 'pdc-09170566@colegiosingles.com', password: 'ingles2025', full_name: 'CAMILA FABREGAS VILLARREAL', cohort: 'IPDC1' },

    // IPDC3
    { email: 'pdc-07190459@colegiosingles.com', password: 'ingles2025', full_name: 'ALEJANDRO VARGAS LIEVIN', cohort: 'IPDC3' },
    { email: 'pdc-05241555@colegiosingles.com', password: 'ingles2025', full_name: 'TANIA AIXA CALLEJAS CALDERON', cohort: 'IPDC3' },
    { email: 'pdc-04241516@colegiosingles.com', password: 'ingles2025', full_name: 'ARIANA PASTEN DA SILVA', cohort: 'IPDC3' },
    { email: 'pdc-09170437@colegiosingles.com', password: 'ingles2025', full_name: 'OSCAR EMILIANO BARRERA UCAN', cohort: 'IPDC3' },
    { email: 'pdc-09170372@colegiosingles.com', password: 'ingles2025', full_name: 'DIEGO SEBASTIAN SALAZAR CRUZ', cohort: 'IPDC3' },
    { email: 'pdc-02241484@colegiosingles.com', password: 'ingles2025', full_name: 'ROSA ITXEL PAREDES SALVADOR', cohort: 'IPDC3' },
    { email: 'pdc-03231299@colegiosingles.com', password: 'ingles2025', full_name: 'AARON ALEJANDRO CHAVEZ LOPEZ', cohort: 'IPDC3' },
    { email: 'pdc-09170279@colegiosingles.com', password: 'ingles2025', full_name: 'EMMA REINA DOMINGUEZ', cohort: 'IPDC3' },
    { email: 'pdc-05190394@colegiosingles.com', password: 'ingles2025', full_name: 'REBECCA FAVAROTTA FRESCHI', cohort: 'IPDC3' },
    { email: 'pdc-09170334@colegiosingles.com', password: 'ingles2025', full_name: 'RODOLFO DE JESUS LOPEZ GARCIA', cohort: 'IPDC3' },
    { email: 'pdc-05241548@colegiosingles.com', password: 'ingles2025', full_name: 'LEONARDO UTIEL BAUTISTA GUTIERREZ', cohort: 'IPDC3' },
    { email: 'pdc-01251692@colegiosingles.com', password: 'ingles2025', full_name: 'ALISON RENATA ZARATE ESCOBEDO', cohort: 'IPDC3' },
    { email: 'pdc-02220873@colegiosingles.com', password: 'ingles2025', full_name: 'VICTOR ANDRES RON-PEDRIQUE SANCHEZ', cohort: 'IPDC3' },
    { email: 'pdc-07221073@colegiosingles.com', password: 'ingles2025', full_name: 'SERGIO ALEJANDRO MENDOZA LOPEZ', cohort: 'IPDC3' },
    { email: 'pdc-06241602@colegiosingles.com', password: 'ingles2025', full_name: 'LUCA TALAMANTES FERNANDEZ', cohort: 'IPDC3' },
    { email: 'pdc-02241493@colegiosingles.com', password: 'ingles2025', full_name: 'DULCE SHANNEY OLAN LOPEZ', cohort: 'IPDC3' },
    { email: 'pdc-09170689@colegiosingles.com', password: 'ingles2025', full_name: 'VALERIA HERNANDEZ BALAM', cohort: 'IPDC3' },
    { email: 'pdc-09170106@colegiosingles.com', password: 'ingles2025', full_name: 'ALESSANDRO KALTEMBACHER TORRES', cohort: 'IPDC3' },
    { email: 'pdc-05231327@colegiosingles.com', password: 'ingles2025', full_name: 'SANTIAGO ALFREDO BOSQUEZ PEREZ', cohort: 'IPDC3' },
    { email: 'pdc-09170325@colegiosingles.com', password: 'ingles2025', full_name: 'SALMA ESMERALDA ORTIZ SALDAÑA', cohort: 'IPDC3' },
    { email: 'pdc-09170333@colegiosingles.com', password: 'ingles2025', full_name: 'DARIELY MICHELLE MIRANDA BONILLA', cohort: 'IPDC3' },
    { email: 'pdc-07221060@colegiosingles.com', password: 'ingles2025', full_name: 'XAVIER GALIEL DEL TORO AGUIRRE', cohort: 'IPDC3' },
    { email: 'pdc-09170416@colegiosingles.com', password: 'ingles2025', full_name: 'SOFIA VILLASEÑOR BOGDAN', cohort: 'IPDC3' },
    { email: 'pdc-02251732@colegiosingles.com', password: 'ingles2025', full_name: 'MAXIMILIANO VILLALOBOS GOMEZ', cohort: 'IPDC3' },
    { email: 'pdc-09170199@colegiosingles.com', password: 'ingles2025', full_name: 'MIA CHARLOTTE GONZALEZ CLAISSE', cohort: 'IPDC3' },
    { email: 'pdc-09170161@colegiosingles.com', password: 'ingles2025', full_name: 'EVA ISABELLA MARTINEZ GALVAN', cohort: 'IPDC3' },
    { email: 'pdc-09170120@colegiosingles.com', password: 'ingles2025', full_name: 'ANA VALERIA VALTIERRA HERNANDEZ', cohort: 'IPDC3' },
    { email: 'pdc-02241479@colegiosingles.com', password: 'ingles2025', full_name: 'LUNA MARTELLI FLORES', cohort: 'IPDC3' },
    { email: 'pdc-09170251@colegiosingles.com', password: 'ingles2025', full_name: 'CARLOS ANDRE PEREZ BENAVIDES', cohort: 'IPDC3' },
    { email: 'pdc-09170270@colegiosingles.com', password: 'ingles2025', full_name: 'NICOLAS GOMEZ LUNA SILVA', cohort: 'IPDC3' },
    { email: 'pdc-05241558@colegiosingles.com', password: 'ingles2025', full_name: 'MOISES SALVADOR PEREZ LAZARO', cohort: 'IPDC3' },
    { email: 'pdc-09170210@colegiosingles.com', password: 'ingles2025', full_name: 'GIOVANNA HERMOSA GARCIA', cohort: 'IPDC3' },
    { email: 'pdc-02231245@colegiosingles.com', password: 'ingles2025', full_name: 'WILLIAM BOUCHARD', cohort: 'IPDC3' },
    { email: 'pdc-04241511@colegiosingles.com', password: 'ingles2025', full_name: 'ANA CASTAÑEDA MORA', cohort: 'IPDC3' },
    { email: 'pdc-08200609@colegiosingles.com', password: 'ingles2025', full_name: 'EMILIO ANTONIO GARCÍA RIVERA', cohort: 'IPDC3' },
    { email: 'pdc-05220999@colegiosingles.com', password: 'ingles2025', full_name: 'SOPHIA RUIZ GARCIA', cohort: 'IPDC3' },
    { email: 'pdc-03231271@colegiosingles.com', password: 'ingles2025', full_name: 'LUCIANA WROBEL ROLDAN', cohort: 'IPDC3' },
    { email: 'pdc-03231272@colegiosingles.com', password: 'ingles2025', full_name: 'MARIA VALENTINA WROBEL ROLDAN', cohort: 'IPDC3' },
    { email: 'pdc-05251806@colegiosingles.com', password: 'ingles2025', full_name: 'ADRIANA VALENTINA MEDINA AGUILAR', cohort: 'IPDC3' },
    { email: 'pdc-07231386@colegiosingles.com', password: 'ingles2025', full_name: 'DIEGO ENRIQUE ARIAS VELAZQUEZ', cohort: 'IPDC3' },
    { email: 'pdc-08210739@colegiosingles.com', password: 'ingles2025', full_name: 'GISELLE ABRIL ESCAREÑO TRUJILLO', cohort: 'IPDC3' },
    { email: 'pdc-03241504@colegiosingles.com', password: 'ingles2025', full_name: 'KELLY CANCHE SANCHEZ', cohort: 'IPDC3' },
    { email: 'pdc-06251822@colegiosingles.com', password: 'ingles2025', full_name: 'CLAUDIO LOPEZ GUTIERREZ', cohort: 'IPDC3' },
    { email: 'pdc-06251826@colegiosingles.com', password: 'ingles2025', full_name: 'RAUL FERNANDO ARAUJO LUNA', cohort: 'IPDC3' },
    { email: 'pdc-06251838@colegiosingles.com', password: 'ingles2025', full_name: 'MAX ALEJANDRO CORONA ALTAMIRANO', cohort: 'IPDC3' },
    { email: 'pdc-08190488@colegiosingles.com', password: 'ingles2025', full_name: 'CARLO ALEJANDRO ORDAZ GUERRERO', cohort: 'IPDC3' },
    { email: 'pdc-05241551@colegiosingles.com', password: 'ingles2025', full_name: 'SEBASTIAN ANDRES PEREZ D´HERS', cohort: 'IPDC3' },
    { email: 'pdc-09170337@colegiosingles.com', password: 'ingles2025', full_name: 'GRETEL SAIME DIAZ GUTIERREZ', cohort: 'IPDC3' },
    { email: 'pdc-06231350@colegiosingles.com', password: 'ingles2025', full_name: 'CARLOS JORGE FALS OCHOA', cohort: 'IPDC3' },
    { email: 'pdc-05231324@colegiosingles.com', password: 'ingles2025', full_name: 'IAN ANDRE CASTEL RIEBELING', cohort: 'IPDC3' },
    { email: 'pdc-07241631@colegiosingles.com', password: 'ingles2025', full_name: 'JEREMIAH CHRISTIAN KING', cohort: 'IPDC3' },
    { email: 'pdc-06241586@colegiosingles.com', password: 'ingles2025', full_name: 'ALISON WELBOURNE VIDAL', cohort: 'IPDC3' },
    { email: 'pdc-07251873@colegiosingles.com', password: 'ingles2025', full_name: 'MAURICIO LEAL ROJAS', cohort: 'IPDC3' },
    { email: 'pdc-08221157@colegiosingles.com', password: 'ingles2025', full_name: 'MATIAS EMILIANO LEON REYES', cohort: 'IPDC3' },
    { email: 'pdc-09170477@colegiosingles.com', password: 'ingles2025', full_name: 'NAOMI VALERIA CHI MENDOZA', cohort: 'IPDC3' },
    { email: 'pdc-08221142@colegiosingles.com', password: 'ingles2025', full_name: 'MIGUEL ANGEL GARCIA FAGOAGA', cohort: 'IPDC3' },
    { email: 'pdc-06241603@colegiosingles.com', password: 'ingles2025', full_name: 'ALEJANDRO ANDORENI ESQUIVEL DIAZ', cohort: 'IPDC3' },
    { email: 'pdc-08251885@colegiosingles.com', password: 'ingles2025', full_name: 'HARLEY DANIELA CUGNO', cohort: 'IPDC3' },
    { email: 'pdc-08210724@colegiosingles.com', password: 'ingles2025', full_name: 'ARI ALEXANDER HERNANDEZ NIETO', cohort: 'IPDC3' },
    { email: 'pdc-08251888@colegiosingles.com', password: 'ingles2025', full_name: 'JAVIER ALEJANDRO REGALADO ALPUCHE', cohort: 'IPDC3' },
    { email: 'pdc-03220903@colegiosingles.com', password: 'ingles2025', full_name: 'SANTIAGO GOMEZ RUBIO', cohort: 'IPDC3' },

    // IPDC5
    { email: 'pdc-03231292@colegiosingles.com', password: 'ingles2025', full_name: 'BRYAN MORENO SALDIVAR', cohort: 'IPDC5' },
    { email: 'pdc-09170104@colegiosingles.com', password: 'ingles2025', full_name: 'BENJAMIN EMILIANO CARMONA VEGA', cohort: 'IPDC5' },
    { email: 'pdc-07241623@colegiosingles.com', password: 'ingles2025', full_name: 'SOPHIA MARGARITA RENERO CANGIANO', cohort: 'IPDC5' },
    { email: 'pdc-09170625@colegiosingles.com', password: 'ingles2025', full_name: 'MARIAN AVALOS VAZQUEZ', cohort: 'IPDC5' },
    { email: 'pdc-02231238@colegiosingles.com', password: 'ingles2025', full_name: 'RENEE MURILLO ENCINAS', cohort: 'IPDC5' },
    { email: 'pdc-09170524@colegiosingles.com', password: 'ingles2025', full_name: 'GILBERTO JAIME LARES', cohort: 'IPDC5' },
    { email: 'pdc-09170154@colegiosingles.com', password: 'ingles2025', full_name: 'SHAILA AMAIRANI FARIAS RODRIGUEZ', cohort: 'IPDC5' },
    { email: 'pdc-05231330@colegiosingles.com', password: 'ingles2025', full_name: 'AXEL GEOVANI CAHUICH VAZQUEZ', cohort: 'IPDC5' },
    { email: 'pdc-06190448@colegiosingles.com', password: 'ingles2025', full_name: 'DEREK ARAMIS NAVARRO RODRIGUEZ', cohort: 'IPDC5' },
    { email: 'pdc-05231329@colegiosingles.com', password: 'ingles2025', full_name: 'SAMUEL TRUDEAU ROJAS', cohort: 'IPDC5' },
    { email: 'pdc-01220854@colegiosingles.com', password: 'ingles2025', full_name: 'MARIAN SOTELO ROJAS', cohort: 'IPDC5' },
    { email: 'pdc-09170107@colegiosingles.com', password: 'ingles2025', full_name: 'FRIDA SOFIA CAMPILLO JECHEN', cohort: 'IPDC5' },
    { email: 'pdc-09170516@colegiosingles.com', password: 'ingles2025', full_name: 'ANA CAMILA GALLARDO ESPINOSA', cohort: 'IPDC5' },
    { email: 'pdc-03220922@colegiosingles.com', password: 'ingles2025', full_name: 'ALEKSANDER SCHEIMAN SCALA', cohort: 'IPDC5' },
    { email: 'pdc-09170207@colegiosingles.com', password: 'ingles2025', full_name: 'GIADA LESERRI CHAHIN', cohort: 'IPDC5' },
    { email: 'pdc-03241505@colegiosingles.com', password: 'ingles2025', full_name: 'ALBAN KALEB PEÑA BETANCOURT', cohort: 'IPDC5' },
    { email: 'pdc-04231309@colegiosingles.com', password: 'ingles2025', full_name: 'EDITH NATALI SANCHEZ LEBRIJA', cohort: 'IPDC5' },
    { email: 'pdc-07210697@colegiosingles.com', password: 'ingles2025', full_name: 'DANIELA CISNEROS RUEDA', cohort: 'IPDC5' },
    { email: 'pdc-09170098@colegiosingles.com', password: 'ingles2025', full_name: 'CAROLINA RIVERA MEZQUITA', cohort: 'IPDC5' },
    { email: 'pdc-06210680@colegiosingles.com', password: 'ingles2025', full_name: 'IKER MORALES ROJAS', cohort: 'IPDC5' },
    { email: 'pdc-07231382@colegiosingles.com', password: 'ingles2025', full_name: 'AMY LIZETH MIRANDA SAENZ', cohort: 'IPDC5' },
    { email: 'pdc-03231267@colegiosingles.com', password: 'ingles2025', full_name: 'ERIK MARIO GONZALEZ DIAZ DE LEON', cohort: 'IPDC5' },
    { email: 'pdc-02231246@colegiosingles.com', password: 'ingles2025', full_name: 'ESTHER GABRIELA MIRANDA MEJIA', cohort: 'IPDC5' },
    { email: 'pdc-09170243@colegiosingles.com', password: 'ingles2025', full_name: 'LUNA GRAIEB MELGOZA', cohort: 'IPDC5' },
    { email: 'pdc-09170129@colegiosingles.com', password: 'ingles2025', full_name: 'ALONDRA TORRES REYES', cohort: 'IPDC5' },
    { email: 'pdc-09170341@colegiosingles.com', password: 'ingles2025', full_name: 'NOELIA ROMINA RIBA', cohort: 'IPDC5' },
    { email: 'pdc-09231426@colegiosingles.com', password: 'ingles2025', full_name: 'DERECK JOSE BALZA GARCIA', cohort: 'IPDC5' },
    { email: 'pdc-06221044@colegiosingles.com', password: 'ingles2025', full_name: 'MIA IZRAELLY', cohort: 'IPDC5' },
    { email: 'pdc-04231317@colegiosingles.com', password: 'ingles2025', full_name: 'MARIANA FLORES PALOMINO', cohort: 'IPDC5' },
    { email: 'pdc-07241624@colegiosingles.com', password: 'ingles2025', full_name: 'MICHAEL JAY RANDLES SOLANO', cohort: 'IPDC5' },
    { email: 'pdc-06190447@colegiosingles.com', password: 'ingles2025', full_name: 'EDUARDO CALEB GARCIA LOPEZ', cohort: 'IPDC5' },
    { email: 'pdc-07231363@colegiosingles.com', password: 'ingles2025', full_name: 'ANA SOFIA RAMIREZ GOMEZ', cohort: 'IPDC5' },
    { email: 'pdc-02251745@colegiosingles.com', password: 'ingles2025', full_name: 'JESHUA ALEXIS RUANOVA MONTIEL', cohort: 'IPDC5' },
    { email: 'pdc-08241653@colegiosingles.com', password: 'ingles2025', full_name: 'JAMARIA JASLINE CASTLE', cohort: 'IPDC5' },
    { email: 'pdc-09170082@colegiosingles.com', password: 'ingles2025', full_name: 'DANIEL HERNANDEZ FIERRO', cohort: 'IPDC5' },
    { email: 'pdc-08180276@colegiosingles.com', password: 'ingles2025', full_name: 'MISAEL ACOSTA GUERRA', cohort: 'IPDC5' },
    { email: 'pdc-08190480@colegiosingles.com', password: 'ingles2025', full_name: 'JOSE ANTONIO RODRIGUEZ RANGEL', cohort: 'IPDC5' },
    { email: 'pdc-05251785@colegiosingles.com', password: 'ingles2025', full_name: 'VALERIA GAMBOA ESCOBEDO', cohort: 'IPDC5' },
    { email: 'pdc-05251791@colegiosingles.com', password: 'ingles2025', full_name: 'ELMY MARIEL SANDOVAL ARJONA', cohort: 'IPDC5' },
    { email: 'pdc-05251800@colegiosingles.com', password: 'ingles2025', full_name: 'LUNA SOFIA MEDINA PEÑA', cohort: 'IPDC5' },
    { email: 'pdc-09170136@colegiosingles.com', password: 'ingles2025', full_name: 'ALEJANDRO SANTOS PALACIOS', cohort: 'IPDC5' },
    { email: 'pdc-05251807@colegiosingles.com', password: 'ingles2025', full_name: 'ISABELA MENDEZ MUELA', cohort: 'IPDC5' },
    { email: 'pdc-09170097@colegiosingles.com', password: 'ingles2025', full_name: 'JOSÉ ALEJANDRO ACEVEDO SALCEDO', cohort: 'IPDC5' },
    { email: 'pdc-09210789@colegiosingles.com', password: 'ingles2025', full_name: 'MYKOLA MOSKALYK', cohort: 'IPDC5' },
    { email: 'pdc-06251834@colegiosingles.com', password: 'ingles2025', full_name: 'ANUAR KURI FERNANDEZ', cohort: 'IPDC5' },
    { email: 'pdc-03180170@colegiosingles.com', password: 'ingles2025', full_name: 'JULIETA SANTA ANA RIZO', cohort: 'IPDC5' },
    { email: 'pdc-08241660@colegiosingles.com', password: 'ingles2025', full_name: 'REGINA OSORIO NERI', cohort: 'IPDC5' },
    { email: 'pdc-06231335@colegiosingles.com', password: 'ingles2025', full_name: 'MEGAN DARLA MACIAS DONSEL', cohort: 'IPDC5' },
    { email: 'pdc-02231235@colegiosingles.com', password: 'ingles2025', full_name: 'LUCAS ORTIZ PEREZ', cohort: 'IPDC5' },
    { email: 'pdc-02231234@colegiosingles.com', password: 'ingles2025', full_name: 'ADRIANO ORTIZ PEREZ', cohort: 'IPDC5' },
    { email: 'pdc-09170268@colegiosingles.com', password: 'ingles2025', full_name: 'RENATA NAVARRETE HERNANDEZ', cohort: 'IPDC5' },
    { email: 'pdc-04220939@colegiosingles.com', password: 'ingles2025', full_name: 'HAZIEL EFRAIN HIPOLITO CRUZ', cohort: 'IPDC5' },
    { email: 'pdc-06231338@colegiosingles.com', password: 'ingles2025', full_name: 'GIOVANNA ZARCO VARGAS', cohort: 'IPDC5' },
    { email: 'tul-12200066@colegiosingles.com', password: 'ingles2025', full_name: 'QUIMBURAC DE LA VEGA BREA', cohort: 'IPDC5' },
    { email: 'pdc-05231325@colegiosingles.com', password: 'ingles2025', full_name: 'ZOE NAOMI SANDOVAL ARTEAGA', cohort: 'IPDC5' },
    { email: 'pdc-07231387@colegiosingles.com', password: 'ingles2025', full_name: 'EMILIA ITURRIAGA CANO', cohort: 'IPDC5' },
    { email: 'pdc-09170155@colegiosingles.com', password: 'ingles2025', full_name: 'ARTURO GONZALEZ GUZMAN', cohort: 'IPDC5' },
    { email: 'pdc-07251865@colegiosingles.com', password: 'ingles2025', full_name: 'IAN YAKUNA POLIN LOPEZ', cohort: 'IPDC5' },
    { email: 'pdc-05220983@colegiosingles.com', password: 'ingles2025', full_name: 'YERANNI ITZEL RAMIREZ TORRES', cohort: 'IPDC5' },
    { email: 'pdc-12221201@colegiosingles.com', password: 'ingles2025', full_name: 'SANTIAGO MENA PATIÑO', cohort: 'IPDC5' }
]

const StudentManagement: React.FC<StudentManagementProps> = ({ centerName }) => {
    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState<Results | null>(null)
    const [selectedCohort, setSelectedCohort] = useState<string>('all')
    const [failedUsers, setFailedUsers] = useState<UserData[]>([])

    // Hooks for user management
    const { users, fetchUsers, fetchUsersByCohort, deleteUser } = useUserManagement()
    const [localUsers, setLocalUsers] = useState<any[]>([])
    const [isDeleting, setIsDeleting] = useState<string | null>(null)

    // Fetch users when cohort changes
    useEffect(() => {
        const loadUsers = async () => {
            if (selectedCohort === 'all') {
                await fetchUsers()
            } else {
                await fetchUsersByCohort(selectedCohort)
            }
        }
        loadUsers()
    }, [selectedCohort])

    useEffect(() => {
        setLocalUsers(users)
    }, [users])

    const handleDeleteUser = async (userId: string, email: string) => {
        if (!confirm(`¿Estás seguro de que deseas eliminar al usuario ${email}? Esta acción no se puede deshacer.`)) return

        try {
            setIsDeleting(userId)
            await deleteUser(userId)
            setLocalUsers(prev => prev.filter(u => u.id !== userId))
        } catch (error: any) {
            alert(`Error al eliminar usuario: ${error.message}`)
        } finally {
            setIsDeleting(null)
        }
    }

    const insertUsers = async (cohort: string) => {
        setLoading(true)
        setResults(null)
        setFailedUsers([]) // Clear previous failures

        const usersToInsert = cohort === 'all'
            ? usersData
            : usersData.filter(user => user.cohort === cohort)

        const results: Results = {
            success: 0,
            errors: 0,
            errorDetails: [],
            processed: []
        }

        console.log(`Iniciando inserción de ${usersToInsert.length} usuarios...`)

        for (const user of usersToInsert) {
            try {
                const { error } = await supabase.auth.signUp({
                    email: user.email,
                    password: user.password,
                    options: {
                        data: {
                            full_name: user.full_name,
                            cohort: user.cohort,
                            username: user.email, // Usar email como username
                            password: user.password,
                            firstname: user.full_name.split(' ')[0] || '',
                            lastname: user.full_name.split(' ').slice(1).join(' ') || '',
                            cohort1: user.cohort
                        }
                    }
                })

                if (error) {
                    console.error(`❌ Error con ${user.email}:`, error.message)
                    results.errors++
                    results.errorDetails.push({
                        email: user.email,
                        error: error.message
                    })
                    results.processed.push({
                        email: user.email,
                        status: 'error',
                        message: error.message
                    })
                    setFailedUsers(prev => [...prev, user])
                } else {
                    console.log(`✅ ${user.email} - ${user.full_name}`)
                    results.success++
                    results.processed.push({
                        email: user.email,
                        status: 'success',
                        message: 'Usuario creado exitosamente'
                    })
                }

                // Pausa para evitar rate limiting
                await new Promise(resolve => setTimeout(resolve, 200))

            } catch (error: any) {
                console.error(`❌ Error inesperado con ${user.email}:`, error)
                results.errors++
                results.errorDetails.push({
                    email: user.email,
                    error: error.message
                })
                results.processed.push({
                    email: user.email,
                    status: 'error',
                    message: error.message
                })
                setFailedUsers(prev => [...prev, user])
            }
        }

        setResults(results)
        setLoading(false)
        // Refresh user list after insertion
        if (selectedCohort === 'all') fetchUsers()
        else fetchUsersByCohort(selectedCohort)
    }

    // Función para insertar solo usuarios que fallaron anteriormente
    const insertFailedUsers = async () => {
        if (failedUsers.length === 0) {
            alert('No hay usuarios fallidos para reintentar. Primero ejecuta una inserción.')
            return
        }

        setLoading(true)
        setResults(null)
        const usersToRetry = [...failedUsers]
        setFailedUsers([]) // Clear failures to track new ones

        const results: Results = {
            success: 0,
            errors: 0,
            errorDetails: [],
            processed: []
        }

        console.log(`Reintentando inserción de ${usersToRetry.length} usuarios que fallaron...`)

        for (const user of usersToRetry) {
            try {
                const { error } = await supabase.auth.signUp({
                    email: user.email,
                    password: user.password,
                    options: {
                        data: {
                            full_name: user.full_name,
                            cohort: user.cohort,
                            username: user.email, // Usar email como username
                            password: user.password,
                            firstname: user.full_name.split(' ')[0] || '',
                            lastname: user.full_name.split(' ').slice(1).join(' ') || '',
                            cohort1: user.cohort
                        }
                    }
                })

                if (error) {
                    // ... errors handling
                    console.error(`❌ Error con ${user.email}:`, error.message)
                    results.errors++
                    results.errorDetails.push({
                        email: user.email,
                        error: error.message
                    })
                    results.processed.push({
                        email: user.email,
                        status: 'error',
                        message: error.message
                    })
                    setFailedUsers(prev => [...prev, user])
                } else {
                    console.log(`✅ ${user.email} - ${user.full_name}`)
                    results.success++
                    results.processed.push({
                        email: user.email,
                        status: 'success',
                        message: 'Usuario creado exitosamente'
                    })
                }

                // Pausa más larga para evitar rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000))

            } catch (error: any) {
                // ... error handling
                console.error(`❌ Error inesperado con ${user.email}:`, error)
                results.errors++
                results.errorDetails.push({
                    email: user.email,
                    error: error.message
                })
                results.processed.push({
                    email: user.email,
                    status: 'error',
                    message: error.message
                })
                setFailedUsers(prev => [...prev, user])
            }
        }

        setResults(results)
        setLoading(false)
        // Refresh user list
        if (selectedCohort === 'all') fetchUsers()
        else fetchUsersByCohort(selectedCohort)
        return results
    }

    return (
        <div className="admin-section" style={{ marginTop: '2rem' }}>
            <h2>👥 Gestión de Alumnos - {centerName || 'General'}</h2>

            <div className="cohort-selector">
                <label>
                    <input
                        type="radio"
                        name="cohort-mgt"
                        value="all"
                        checked={selectedCohort === 'all'}
                        onChange={(e) => setSelectedCohort(e.target.value)}
                    />
                    Todos
                </label>
                <label>
                    <input
                        type="radio"
                        name="cohort-mgt"
                        value="IPDC1"
                        checked={selectedCohort === 'IPDC1'}
                        onChange={(e) => setSelectedCohort(e.target.value)}
                    />
                    IPDC1
                </label>
                <label>
                    <input
                        type="radio"
                        name="cohort-mgt"
                        value="IPDC3"
                        checked={selectedCohort === 'IPDC3'}
                        onChange={(e) => setSelectedCohort(e.target.value)}
                    />
                    IPDC3
                </label>
                <label>
                    <input
                        type="radio"
                        name="cohort-mgt"
                        value="IPDC5"
                        checked={selectedCohort === 'IPDC5'}
                        onChange={(e) => setSelectedCohort(e.target.value)}
                    />
                    IPDC5
                </label>
            </div>

            <div className="button-group" style={{ marginBottom: '20px' }}>
                <button
                    className="insert-btn"
                    onClick={() => insertUsers(selectedCohort)}
                    disabled={loading}
                >
                    {loading ? '⏳ Procesando...' : '📥 Importar Alumnos desde CSV'}
                </button>

                {failedUsers.length > 0 && (
                    <button
                        className="insert-btn retry"
                        onClick={insertFailedUsers}
                        disabled={loading}
                    >
                        {loading ? '⏳ Reintentando...' : `🔄 Reintentar Fallidos (${failedUsers.length})`}
                    </button>
                )}
            </div>

            {/* Results Section */}
            {results && (
                <div className="results-section">
                    <h3>📈 Resultados de Importación</h3>
                    <div className="results-summary">
                        <div className="result-item success">
                            <span className="result-number">{results.success}</span>
                            <span className="result-label">Creados</span>
                        </div>
                        <div className="result-item error">
                            <span className="result-number">{results.errors}</span>
                            <span className="result-label">Errores</span>
                        </div>
                    </div>
                    {/* Detailed errors if needed */}
                    {results.errorDetails.length > 0 && (
                        <div className="errors-details">
                            <h4>❌ Errores Detallados:</h4>
                            <div className="error-list" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                {results.errorDetails.map((error, index) => (
                                    <div key={index} className="error-item">
                                        <strong>{error.email}</strong>: {error.error}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* User List & Delete */}
            <div className="user-list-section">
                <h3>📋 Lista de Alumnos Registrados ({localUsers.length})</h3>
                <div className="users-table-container" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                    <table className="users-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f5f7fa', textAlign: 'left' }}>
                                <th style={{ padding: '10px' }}>Nombre</th>
                                <th style={{ padding: '10px' }}>Email</th>
                                <th style={{ padding: '10px' }}>Cohorte</th>
                                <th style={{ padding: '10px' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {localUsers.map((user) => (
                                <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '10px' }}>{user.full_name || 'N/A'}</td>
                                    <td style={{ padding: '10px' }}>{user.email}</td>
                                    <td style={{ padding: '10px' }}>
                                        <span className={`cohort-badge ${user.cohort?.toLowerCase()}`}>
                                            {user.cohort || '-'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '10px' }}>
                                        <button
                                            onClick={() => handleDeleteUser(user.id, user.email)}
                                            className="delete-btn"
                                            style={{
                                                background: '#ff4d4f',
                                                color: 'white',
                                                border: 'none',
                                                padding: '5px 10px',
                                                borderRadius: '4px',
                                                cursor: 'pointer'
                                            }}
                                            disabled={isDeleting === user.id}
                                        >
                                            {isDeleting === user.id ? '...' : 'Eliminar'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {localUsers.length === 0 && (
                                <tr>
                                    <td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                                        No se encontraron alumnos para este criterio.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    )
}

export default StudentManagement
