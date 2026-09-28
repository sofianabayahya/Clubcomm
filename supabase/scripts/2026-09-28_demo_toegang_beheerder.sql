-- Besluit 89: de initiatiefnemer (persoon p-beheer bij DCG) op de toegangslijst van de demo zetten.
-- Het e-mailadres komt uit de database zelf, zodat het niet in de code staat.
insert into public.demo_toegang (email, naam)
select lower(trim(data ->> 'email')), 'Initiatiefnemer'
from public.rij where club_id = 'dcg' and soort = 'contact' and id = 'p-beheer' and coalesce(data ->> 'email', '') <> ''
on conflict (email) do nothing;

-- Iemand toevoegen:  insert into public.demo_toegang (email, naam) values ('naam@club.nl', 'Voorzitter SCPB');
-- Iemand weghalen:   delete from public.demo_toegang where email = 'naam@club.nl';
