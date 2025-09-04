import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { activityRecordService } from '../services/activity-record';

export const useActivityRecords = (organizationId?: string) => {
  return useQuery({
    queryKey: ['activityRecords', organizationId],
    queryFn: () => activityRecordService.getList(organizationId),
    enabled: !!organizationId,
  });
};

export const useCreateActivityRecord = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: activityRecordService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activityRecords'] });
    },
  });
};