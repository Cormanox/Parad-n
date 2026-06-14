// Base de datos de rutas de autobuses - Enfoque exclusivo Ruta 256
export const busRoutes = [
  {
    id: 1,
    number: "256",
    name: "Naranjo - Rosario (y Viceversa)",
    operator: "Transportes Cubero Bonilla de Copi Lara",
    price: 450,
    duration: 35,
    frequency: "Según horario (15-30 min)",
    color: "#059669", // Verde Esmeralda
    description: "Servicio local que conecta el centro de Naranjo con el distrito de Rosario, operando bajo las modalidades 'Arriba' (por Calle Hornos) y 'Abajo' (por El Llano). Horario vigente a partir del 05 de mayo de 2025.",
    stops: [
      { name: "Terminal Naranjo Centro", lat: 10.0988, lng: -84.3792, description: "Terminal central de buses en Naranjo Centro." },
      { name: "Calle Hornos", lat: 10.1012, lng: -84.3695, description: "Recorrido 'Arriba' por Calle Hornos." },
      { name: "El Llano", lat: 10.0945, lng: -84.3682, description: "Recorrido 'Abajo' por el Llano." },
      { name: "Barrio Vargas", lat: 10.0920, lng: -84.3620, description: "Pasando por el sector intermedio de Vargas." },
      { name: "Santa Margarita", lat: 10.0872, lng: -84.3592, description: "Parada de transbordo en Santa Margarita." },
      { name: "CD Progreso", lat: 10.0815, lng: -84.3548, description: "Sobre el sector del Progreso." },
      { name: "Cruce de Jean", lat: 10.0762, lng: -84.3526, description: "Cruce final de retorno opcional." },
      { name: "Terminal Rosario Centro", lat: 10.0718, lng: -84.3518, description: "Terminal en la comunidad de Rosario Centro." }
    ],
    schedules: {
      weekday: {
        toRosario: [
          { time: "05:00", route: "Santa Margarita (5:35 AM)", via: "Arriba" },
          { time: "06:00", route: "Periférica (no entra a Calle Pérez)", via: "Abajo" },
          { time: "06:25", route: "Periférica (no entra a Calle Pérez)", via: "Arriba" },
          { time: "07:15", route: "Periférica (no entra a Calle Pérez)", via: "Abajo" },
          { time: "07:40", route: "Vargas (Rosario)", via: "Abajo" },
          { time: "09:15", route: "CD Progreso", via: "Abajo" },
          { time: "10:15", route: "CD Progreso", via: "Abajo" },
          { time: "11:15", route: "Santa Margarita (12:00 MD)", via: "Arriba" },
          { time: "12:00", route: "CD Progreso", via: "Abajo" },
          { time: "13:15", route: "Vargas (Rosario)", via: "Abajo" },
          { time: "14:15", route: "Vargas (Rosario)", via: "Arriba" },
          { time: "15:15", route: "Vargas (Rosario)", via: "Abajo" },
          { time: "16:15", route: "Santa Margarita (4:55 PM - Sale por Progreso)", via: "Arriba" },
          { time: "17:15", route: "Vargas (Rosario)", via: "Arriba" },
          { time: "18:15", route: "Vargas (Rosario)", via: "Abajo" },
          { time: "19:15", route: "Periférica (se devuelve hasta Cruce de Jean)", via: "Abajo" }
        ],
        toNaranjo: [
          { time: "04:30", route: "Vargas (Rosario)", via: "Arriba" },
          { time: "05:10", route: "Vargas (Rosario)", via: "Abajo" },
          { time: "05:45", route: "Santa Margarita", via: "Arriba" },
          { time: "06:30", route: "Periférica por abajo", via: "Arriba" },
          { time: "07:00", route: "Periférica por arriba", via: "Abajo" },
          { time: "08:00", route: "Periférica por abajo", via: "Arriba" },
          { time: "08:20", route: "Vargas (Rosario)", via: "Abajo" },
          { time: "10:05", route: "CD Progreso", via: "Abajo" },
          { time: "11:00", route: "CD Progreso", via: "Arriba" },
          { time: "12:05", route: "Santa Margarita", via: "Arriba" },
          { time: "13:00", route: "CD Progreso", via: "Abajo" },
          { time: "14:00", route: "Vargas (Rosario)", via: "Abajo" },
          { time: "15:05", route: "Vargas (Rosario)", via: "Arriba" },
          { time: "16:00", route: "Vargas (Rosario)", via: "Arriba" },
          { time: "17:00", route: "Santa Margarita", via: "Abajo" },
          { time: "18:00", route: "Vargas (Rosario)", via: "Arriba" }
        ]
      },
      saturday: {
        toRosario: [
          { time: "05:30", route: "Sta. Margarita", via: "Abajo" },
          { time: "06:15", route: "Periférica / Vargas", via: "Abajo" },
          { time: "07:00", route: "Periférica / Vargas", via: "Abajo" },
          { time: "08:15", route: "Vargas (Rosario)", via: "Arriba" },
          { time: "09:05", route: "Periférica / Vargas", via: "Abajo" },
          { time: "09:50", route: "Sta. Margarita", via: "Arriba" },
          { time: "11:15", route: "CD Progreso", via: "Abajo" },
          { time: "12:15", route: "Sta. Margarita", via: "Arriba" },
          { time: "13:15", route: "Periférica / Vargas", via: "Abajo" },
          { time: "14:15", route: "Periférica / Vargas", via: "Abajo" },
          { time: "15:15", route: "Sta. Margarita", via: "Arriba" },
          { time: "16:15", route: "Periférica / Vargas", via: "Abajo" },
          { time: "17:15", route: "Sta. Margarita", via: "Arriba" },
          { time: "18:15", route: "Vargas (Rosario)", via: "Abajo" },
          { time: "19:15", route: "Periférica (se devuelve hasta Cruce de Jean)", via: "Abajo" }
        ],
        toNaranjo: [
          { time: "05:00", route: "Vargas (Rosario)", via: "Arriba" },
          { time: "05:30", route: "Vargas (Rosario)", via: "Abajo" },
          { time: "06:15", route: "Sta. Margarita", via: "Arriba" },
          { time: "07:00", route: "Periférica / Vargas", via: "Abajo" },
          { time: "07:45", route: "Periférica / Vargas", via: "Abajo" },
          { time: "08:45", route: "Vargas (Rosario)", via: "Arriba" },
          { time: "09:45", route: "Periférica / Vargas", via: "Abajo" },
          { time: "10:30", route: "Sta. Margarita", via: "Arriba" },
          { time: "12:00", route: "CD Progreso", via: "Abajo" },
          { time: "13:00", route: "Sta. Margarita", via: "Arriba" },
          { time: "14:00", route: "Periférica / Vargas", via: "Abajo" },
          { time: "15:00", route: "Periférica / Vargas", via: "Abajo" },
          { time: "16:00", route: "Sta. Margarita", via: "Arriba" },
          { time: "17:00", route: "Periférica / Vargas", via: "Abajo" },
          { time: "18:00", route: "Sta. Margarita", via: "Arriba" }
        ]
      },
      sunday: {
        toRosario: [
          { time: "06:45", route: "Sta. Margarita", via: "Arriba" },
          { time: "08:20", route: "Periférica / Vargas", via: "Abajo" },
          { time: "09:45", route: "Sta. Margarita", via: "Arriba" },
          { time: "11:00", route: "Periférica / Vargas", via: "Abajo" },
          { time: "13:00", route: "Sta. Margarita", via: "Arriba" },
          { time: "14:30", route: "Periférica / Vargas", via: "Abajo" },
          { time: "16:00", route: "Periférica / Vargas", via: "Abajo" },
          { time: "17:30", route: "6:15 pm Sta. Margarita", via: "Arriba" },
          { time: "19:15", route: "Periférica (se devuelve hasta Cruce de Jean)", via: "Abajo" }
        ],
        toNaranjo: [
          { time: "06:00", route: "Vargas (Rosario)", via: "Abajo" },
          { time: "07:20", route: "Sta. Margarita", via: "Arriba" },
          { time: "09:00", route: "Periférica / Vargas", via: "Abajo" },
          { time: "10:20", route: "Sta. Margarita", via: "Arriba" },
          { time: "11:40", route: "Periférica / Vargas", via: "Abajo" },
          { time: "13:45", route: "Sta. Margarita", via: "Arriba" },
          { time: "15:10", route: "Periférica / Vargas", via: "Abajo" },
          { time: "16:40", route: "Periférica / Vargas", via: "Abajo" },
          { time: "18:20", route: "Sta. Margarita", via: "Arriba" }
        ]
      }
    }
  }
];
