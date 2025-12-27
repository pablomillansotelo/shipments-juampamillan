import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Truck,
  Users
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { shipmentsApi, usersApi } from '@/lib/api-server';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  let counts = {
    shipments: 0,
    shipmentsPending: 0,
    shipmentsInTransit: 0,
    users: 0,
  };

  try {
    const [shipments, users] = await Promise.all([
      shipmentsApi.getAll().catch(() => []),
      usersApi.getAll().catch(() => []),
    ]);

    counts = {
      shipments: shipments.length,
      shipmentsPending: shipments.filter((s: any) => s.status === 'pending' || s.status === 'packed').length,
      shipmentsInTransit: shipments.filter((s: any) => s.status === 'in_transit' || s.status === 'shipped').length,
      users: users.length,
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
  }

  const stats = [
    {
      title: 'Shipments',
      value: counts.shipments,
      icon: Truck,
      href: '/shipments',
      description: `${counts.shipmentsPending} pendientes, ${counts.shipmentsInTransit} en tránsito`,
      color: 'text-blue-600'
    },
    {
      title: 'Usuarios',
      value: counts.users,
      icon: Users,
      href: '/users',
      description: 'Usuarios del sistema',
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="flex flex-1 flex-col p-4 md:p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>
            Accesos directos a las funcionalidades principales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
            <Button asChild variant="outline" className="justify-start">
              <Link href="/shipments">
                <Truck className="h-4 w-4 mr-2" />
                Gestionar Shipments
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/users">
                <Users className="h-4 w-4 mr-2" />
                Gestionar Usuarios
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-semibold mb-4">Resumen General</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.title} href={stat.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

