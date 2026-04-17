export type Role = {
    id: number;
    name: string;
    slug: 'super_admin' | 'admin' | 'teknisi';
};

export type OdpStatus = 'active' | 'inactive' | 'full' | 'maintenance' | 'damaged' | 'decommissioned';
export type OdcStatus = 'active' | 'inactive' | 'maintenance' | 'decommissioned';
export type OltStatus = 'active' | 'inactive' | 'maintenance' | 'decommissioned';
export type OntStatus = 'active' | 'inactive' | 'maintenance' | 'decommissioned';
export type NodeType = 'olt' | 'odc' | 'odp' | 'ont';
export type DeviceConnectionType = 'olt_to_odc' | 'odc_to_odp' | 'odp_to_ont';

export type Province = {
    id: number;
    name: string;
    code: string;
    cities_count?: number;
    created_at: string;
    updated_at: string;
};

export type City = {
    id: number;
    province_id: number;
    name: string;
    type: 'kota' | 'kabupaten';
    code: string;
    province?: Pick<Province, 'id' | 'name'>;
    districts_count?: number;
    created_at: string;
    updated_at: string;
};

export type District = {
    id: number;
    city_id: number;
    name: string;
    code: string;
    city?: Pick<City, 'id' | 'name'> & { province?: Pick<Province, 'id' | 'name'> };
    villages_count?: number;
    created_at: string;
    updated_at: string;
};

export type Village = {
    id: number;
    district_id: number;
    name: string;
    type: 'kelurahan' | 'desa';
    postal_code: string | null;
    code: string;
    district?: Pick<District, 'id' | 'name'> & { city?: Pick<City, 'id' | 'name'> & { province?: Pick<Province, 'id' | 'name'> } };
    created_at: string;
    updated_at: string;
};

export type GeoRef = { id: number; name: string };

export type OltOdcSummary = {
    id: number;
    name: string;
    code: string;
    status: OdcStatus;
    total_ports: number;
    used_ports: number;
    capacity_percentage: number;
    odps_count: number;
};

export type Olt = {
    id: number;
    name: string;
    code: string;
    brand: string | null;
    model: string | null;
    ip_address: string | null;
    latitude: number | null;
    longitude: number | null;
    location_description: string | null;
    total_ports: number;
    used_ports: number;
    available_ports: number;
    capacity_percentage: number;
    status: OltStatus;
    notes: string | null;
    city: GeoRef | null;
    district: GeoRef | null;
    village: GeoRef | null;
    odcs?: OltOdcSummary[];
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
};

export type OdcOdpSummary = {
    id: number;
    name: string;
    code: string;
    status: OdpStatus;
    total_ports: number;
    used_ports: number;
    available_ports: number;
    capacity_percentage: number;
    pole_number: string | null;
};

export type Odc = {
    id: number;
    olt_id: number;
    name: string;
    code: string;
    brand: string | null;
    model: string | null;
    latitude: number | null;
    longitude: number | null;
    location_description: string | null;
    address: string | null;
    total_ports: number;
    used_ports: number;
    available_ports: number;
    capacity_percentage: number;
    status: OdcStatus;
    installation_date: string | null;
    notes: string | null;
    olt: Pick<Olt, 'id' | 'name' | 'code' | 'latitude' | 'longitude'> | null;
    city: GeoRef | null;
    district: GeoRef | null;
    village: GeoRef | null;
    odps?: OdcOdpSummary[];
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
};

export type OdpOntSummary = {
    id: number;
    name: string;
    code: string;
    status: OntStatus;
    serial_number: string | null;
    customer_name: string | null;
    latitude: number | null;
    longitude: number | null;
};

export type Odp = {
    id: number;
    odc_id: number | null;
    olt_id: number | null;
    name: string;
    code: string;
    brand: string | null;
    model: string | null;
    latitude: number | null;
    longitude: number | null;
    location_description: string | null;
    address: string | null;
    total_ports: number;
    used_ports: number;
    available_ports: number;
    capacity_percentage: number;
    status: OdpStatus;
    status_label: string;
    installation_date: string | null;
    last_maintenance_date: string | null;
    pole_number: string | null;
    notes: string | null;
    odc: Pick<Odc, 'id' | 'name' | 'code' | 'latitude' | 'longitude'> | null;
    olt: Pick<Olt, 'id' | 'name' | 'code' | 'latitude' | 'longitude'> | null;
    city: GeoRef | null;
    district: GeoRef | null;
    village: GeoRef | null;
    onts?: OdpOntSummary[];
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
};

export type Ont = {
    id: number;
    odp_id: number;
    name: string;
    code: string;
    serial_number: string | null;
    customer_name: string | null;
    latitude: number | null;
    longitude: number | null;
    total_ports: number;
    used_ports: number;
    available_ports: number;
    capacity_percentage: number;
    status: OntStatus;
    installed_at: string | null;
    notes: string | null;
    odp: Pick<Odp, 'id' | 'name' | 'code' | 'latitude' | 'longitude'> | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
};

export type DeviceConnection = {
    id: string;
    type: DeviceConnectionType;
    color: string;
    from: { type: NodeType; id: number; name: string };
    to: { type: NodeType; id: number; name: string };
    positions: [number, number][];
};

export type GeoJsonLineString = {
    type: 'LineString';
    coordinates: [number, number][];
};

export type MaintenanceLog = {
    id: number;
    loggable_type: string;
    loggable_id: number;
    type: 'routine' | 'corrective' | 'emergency' | 'upgrade';
    performed_by: number | null;
    description: string;
    findings: string | null;
    resolution: string | null;
    performed_at: string;
    next_maintenance_at: string | null;
    photo_paths: string[] | null;
    technician: GeoRef | null;
    created_at: string;
    updated_at: string;
};

export type ActivityLog = {
    id: number;
    user_id: number | null;
    subject_type: string;
    subject_id: number | null;
    event: 'created' | 'updated' | 'deleted' | 'restored';
    old_values: Record<string, unknown> | null;
    new_values: Record<string, unknown> | null;
    ip_address: string | null;
    user: { id: number; name: string } | null;
    created_at: string;
};
