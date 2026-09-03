import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppHeader } from '@/components/ui/app-header';
import { Card } from '@/components/ui/card';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { InlineFeedback } from '@/components/ui/inline-feedback';
import { ScreenContainer } from '@/components/ui/screen-container';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { CardSkeleton } from '@/components/ui/skeleton';
import { StatusBadge, type StatusTone } from '@/components/ui/status-badge';
import { Brand, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatDateRange } from '@/lib/format';
import { useProfileContext } from '@/lib/profile';
import { getSpecialTiming } from '@/lib/special-timing';
import { deleteCampaign, getAllCampaigns } from '@/services/burger';
import { deleteSpecial, getSpecials } from '@/services/specials';
import type { BurgerCampaign, CampaignStatus, Special } from '@/types';

type Segment = 'specials' | 'campaigns';

type ListState<T> =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; items: T[] };

const CAMPAIGN_STATUS_TONE: Record<CampaignStatus, StatusTone> = {
  draft: 'neutral',
  scheduled: 'primary',
  active: 'success',
  expired: 'neutral',
};

export default function ManageScreen() {
  const { profile } = useProfileContext();
  const router = useRouter();
  const [segment, setSegment] = useState<Segment>('specials');
  const [specialsState, setSpecialsState] = useState<ListState<Special>>({ status: 'loading' });
  const [campaignsState, setCampaignsState] = useState<ListState<BurgerCampaign>>({
    status: 'loading',
  });
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<
    { type: Segment; id: string; label: string } | null
  >(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadSpecials = useCallback(async () => {
    try {
      const items = await getSpecials();
      setSpecialsState({ status: 'success', items });
    } catch {
      setSpecialsState({
        status: 'error',
        message: "Couldn't load specials. Check your connection and try again.",
      });
    }
  }, []);

  const loadCampaigns = useCallback(async () => {
    try {
      const items = await getAllCampaigns();
      setCampaignsState({ status: 'success', items });
    } catch {
      setCampaignsState({
        status: 'error',
        message: "Couldn't load campaigns. Check your connection and try again.",
      });
    }
  }, []);

  useEffect(() => {
    // Both load*() only call setState from their async continuation — see
    // src/hooks/use-home-screen-data.ts for the sanctioned pattern.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSpecialsState({ status: 'loading' });
    loadSpecials();
    setCampaignsState({ status: 'loading' });
    loadCampaigns();
  }, [loadSpecials, loadCampaigns]);

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      if (pendingDelete.type === 'specials') {
        await deleteSpecial(pendingDelete.id);
        await loadSpecials();
      } else {
        await deleteCampaign(pendingDelete.id);
        await loadCampaigns();
      }
      setPendingDelete(null);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Could not delete this item.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (profile && profile.role === 'customer') {
    return (
      <ScreenContainer>
        <EmptyState
          icon="lock-closed-outline"
          title="Staff access only"
          message="This screen is for Queenstown Rewards staff accounts only."
        />
      </ScreenContainer>
    );
  }

  const activeState = segment === 'specials' ? specialsState : campaignsState;
  const activeRetry = segment === 'specials' ? loadSpecials : loadCampaigns;

  return (
    <>
      <ScreenContainer scroll onRefresh={activeRetry} refreshing={activeState.status === 'loading'}>
        <AppHeader
          title="Manage"
          rightIcon="add"
          rightAccessibilityLabel={segment === 'specials' ? 'Add special' : 'Add campaign'}
          onRightPress={() =>
            router.push(segment === 'specials' ? '/staff/special-form' : '/staff/campaign-form')
          }
        />

        <SegmentedControl
          options={[
            { key: 'specials', label: 'Specials' },
            { key: 'campaigns', label: 'Campaigns' },
          ]}
          value={segment}
          onChange={setSegment}
        />

        {deleteError && <InlineFeedback message={deleteError} />}

        {activeState.status === 'loading' && (
          <>
            <CardSkeleton />
            <CardSkeleton />
          </>
        )}

        {activeState.status === 'error' && (
          <ErrorState message={activeState.message} onRetry={activeRetry} />
        )}

        {activeState.status === 'success' &&
          (activeState.items.length === 0 ? (
            <EmptyState
              icon={segment === 'specials' ? 'pricetag-outline' : 'ribbon-outline'}
              title={segment === 'specials' ? 'No specials yet' : 'No campaigns yet'}
              message={`Tap + to create your first ${segment === 'specials' ? 'special' : 'campaign'}.`}
            />
          ) : segment === 'specials' ? (
            (activeState.items as Special[]).map((special) => {
              const timing = getSpecialTiming(special);
              return (
                <ManageRow
                  key={special.id}
                  title={special.title}
                  dateRange={formatDateRange(special.startDate, special.endDate)}
                  badgeLabel={timing.label}
                  badgeTone={timing.tone}
                  onEdit={() => router.push(`/staff/special-form?id=${special.id}`)}
                  onDelete={() =>
                    setPendingDelete({ type: 'specials', id: special.id, label: special.title })
                  }
                />
              );
            })
          ) : (
            (activeState.items as BurgerCampaign[]).map((campaign) => (
              <ManageRow
                key={campaign.id}
                title={campaign.name}
                dateRange={formatDateRange(campaign.startDate, campaign.endDate)}
                badgeLabel={campaign.status}
                badgeTone={CAMPAIGN_STATUS_TONE[campaign.status]}
                onEdit={() => router.push(`/staff/campaign-form?id=${campaign.id}`)}
                onDelete={() =>
                  setPendingDelete({ type: 'campaigns', id: campaign.id, label: campaign.name })
                }
              />
            ))
          ))}
      </ScreenContainer>

      <ConfirmationDialog
        visible={!!pendingDelete}
        title="Delete this?"
        message={pendingDelete ? `"${pendingDelete.label}" will be permanently deleted.` : ''}
        confirmLabel="Delete"
        destructive
        loading={isDeleting}
        loadingLabel="Deleting"
        onConfirm={handleDelete}
        onDismiss={() => setPendingDelete(null)}
      />
    </>
  );
}

function ManageRow({
  title,
  dateRange,
  badgeLabel,
  badgeTone,
  onEdit,
  onDelete,
}: {
  title: string;
  dateRange: string;
  badgeLabel: string;
  badgeTone: StatusTone;
  onEdit: () => void;
  onDelete: () => void;
}): ReactNode {
  const theme = useTheme();
  return (
    <Card accessibilityLabel={title}>
      <View style={styles.row}>
        <View style={styles.rowText}>
          <ThemedText type="smallBold">{title}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {dateRange}
          </ThemedText>
        </View>
        <StatusBadge label={badgeLabel} tone={badgeTone} />
      </View>
      <View style={styles.actionsRow}>
        <Pressable
          onPress={onEdit}
          accessibilityRole="button"
          accessibilityLabel="Edit"
          style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
        >
          <Ionicons name="create-outline" size={18} color={Brand.primary} />
          <ThemedText type="smallBold" style={{ color: Brand.primary }}>
            Edit
          </ThemedText>
        </Pressable>
        <Pressable
          onPress={onDelete}
          accessibilityRole="button"
          accessibilityLabel="Delete"
          style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
        >
          <Ionicons name="trash-outline" size={18} color={theme.textSecondary} />
          <ThemedText type="smallBold" themeColor="textSecondary">
            Delete
          </ThemedText>
        </Pressable>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.four,
    marginTop: Spacing.two,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionButtonPressed: {
    opacity: 0.6,
  },
});
